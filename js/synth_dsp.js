/*
 * synth_dsp.js
 *
 * This program is licensed under the MIT License.
 * Copyright 2012-2015, aike (@aike1000)
 *
 */

///////////// BROWSER CHECK /////////////////////
window.AudioContext = window.AudioContext || window.webkitAudioContext;
window.addEventListener('load', init, false);
function init() {
	try {
		var context = new AudioContext() ;
	} catch(e) {
		alert('Web Audio API is not supported in this browser');
	}
};

///////////// Init Parameter /////////////////////
var stream_length = 1024;

///////////// VCO /////////////////////

var VCO = function(ctx) {
	this.ctx = ctx;
	this.osc = ctx.createOscillator();
	this.gain = ctx.createGain();
	this.osc.connect(this.gain);

	this.oct   = 0;//12;
	this.fine  = 0;
	this.osc.type  = 'sawtooth';
	this.osc.start(0);
	this.vol = 0.5;
	this.gain.gain.value  = this.vol;
	this.on    = 1;

	this.glideOn = 1;
	this.set_glide_time(20);
	this.pitch = 440;
};

VCO.prototype.connect = function(node) {
	this.gain.connect(node);
}

VCO.prototype.set_pitch = function(p) {
	this.oct = Math.floor((p + 25) / 50) * 12;
};

VCO.prototype.set_fine = function(p) {
	this.fine = (p - 50) / 100;
};

VCO.prototype.set_wave = function(val) {
	val = Math.floor((val + 25) / 50);

	switch(val) {
	case 0:
		this.osc.type = 'triangle';
		break;

	case 1:
		this.osc.type = 'sawtooth';
		break;

	case 2:
		this.osc.type = 'square';
		break;
	}
};

VCO.prototype.set_gain = function(val) {
	this.vol = val / 100;
	if (this.on) {
		this.gain.gain.value = this.vol;
	}
};

VCO.prototype.set_on = function(val) {
	this.on = (val > 0);
	if (this.on) {
		this.gain.gain.value = this.vol;
	} else {
		this.gain.gain.value = 0;
	}
};

VCO.prototype.set_glide_time = function(val) {
	var t = (Math.pow(1.02, val) - 1.0) / 4.0;
	this.glidetime = t;
};

VCO.prototype.set_glide_on = function(val) {
	this.glideOn = (val > 0);
	if (this.glideOn === 0) {
		var currentTime = this.ctx.currentTime;
		this.osc.frequency.cancelScheduledValues(currentTime);
		this.osc.frequency.setValueAtTime(this.pitch, currentTime);
	}
};

VCO.prototype.set_goal_pitch = function(p) {
	this.pitch = p;
	if (this.glideOn) {
		var tempPitch = this.osc.frequency.value;
		var currentTime = this.ctx.currentTime;
		this.osc.frequency.cancelScheduledValues(currentTime);
		this.osc.frequency.setValueAtTime(tempPitch, currentTime);
		this.osc.frequency.linearRampToValueAtTime(p, currentTime + this.glidetime);
	} else {
		this.osc.frequency.setValueAtTime(this.pitch, this.ctx.currentTime);
	}
};

///////////// EG /////////////////////

var EGM = {
	Idle    : 0,
	Latency : 1,
	Attack  : 2,
	Decay   : 3,
	Sustain : 4,
	Release : 5
};

var EG = function(attack_callback) {
	if (attack_callback) {
		this.attack_callback = attack_callback;
	}
	this.gain = 0.0;
	this.time = 0;
	this.mode = EGM.Idle;
	this.a = 0;
	this.d = 20;
	this.s = 100 / 100;
	this.r = 20;
	this.latency = 0;

	this.a_max = 100;
	this.d_max = 100;
	this.r_max = 100;

	this.a_delta = 1.0 / (this.a * 1000 + 1);
	this.d_delta = 1.0 / ((this.d + 5) * 2000 + 1);
	this.r_delta = 1.0 / (this.r * 2000 + 1);
};

EG.prototype.set_a = function(val) {
	this.a = val;
	this.a_delta = 1.0 / (this.a * 1000 + 1);
};
EG.prototype.set_d = function(val) {
	this.d = val;
	this.d_delta = 1.0 / ((this.d + 5) * 2000 + 1);
};
EG.prototype.set_s = function(val) {
	this.s = val / 100.0;
};
EG.prototype.set_r = function(val) {
	this.r = val;
	this.r_delta = 1.0 / (this.r * 2000 + 1);;
};

EG.prototype.note_on = function() {
	this.time = 0;
	this.mode = EGM.Latency;
	this.latency = stream_length;
};

EG.prototype.note_off = function() {
	this.mode = EGM.Release;
};

EG.prototype.next = function() {
	this.time = 0;

	switch (this.mode) {
		case EGM.Latency:
			this.latency--;
			if (this.latency <= 0) {
				this.mode = EGM.Attack;
				if (this.attack_callback) {
					this.attack_callback();
				}
			}
			break;
		case EGM.Attack:
			this.gain += this.a_delta;
			if (this.gain >= 1.0) {
				this.gain = 1.0;
				this.mode = EGM.Decay;
			}
			break;
		case EGM.Decay:
			this.gain -= this.d_delta;
			if (this.gain <= this.s) {
				this.gain = this.s;
				this.mode = EGM.Sustain;
			}
			break;
		case EGM.Sustain:
			break;
		case EGM.Release:
			this.gain -= this.r_delta;
			if (this.gain <= 0.0) {
				this.gain = 0.0;
				this.mode = EGM.Idle;
			}
			break;
		case EGM.Idle:
			break;
	}
};


///////////// VOLUME /////////////////////
var CTL_Volume = function(ctx) {
	this.volume = ctx.createGain();
	this.volume.gain.value = 0.5;
};

CTL_Volume.prototype.set = function(val) {
	this.volume.gain.value = val / 100.0;
};

CTL_Volume.prototype.connect = function(next_node) {
	this.volume.connect(next_node);
};

CTL_Volume.prototype.getnode = function() {
	return this.volume;
};

///////////// DELAY /////////////////////
var FX_Delay = function(ctx) {
	this.wet_value = 0.8;
	this.feedback_value = 0.25;
	this.delaytime = 0.8;
	this.delay = ctx.createDelay();
	this.feedback = ctx.createGain();
	this.wet = ctx.createGain();
	this.dry = ctx.createGain();

	this.delay.delayTime.value = this.delaytime * 0.5;
	this.wet.gain.value = this.wet_value;
	this.feedback.gain.value = this.feedback_value;
	this.dry.gain.value = 1.0;

	this.dry.connect(this.delay);
	this.delay.connect(this.wet);
	this.delay.connect(this.feedback);
	this.feedback.connect(this.delay);
};

FX_Delay.prototype.on = function(val) {
	if (val > 0) {
		this.gain.gain.value = this.wet_value * 0.25;
	} else {
		this.gain.gain.value = 0;
	}
}

FX_Delay.prototype.set = function(val) {
	this.wet_value = val / 100.0;
	this.wet.gain.value = this.wet_value;
};

FX_Delay.prototype.connect = function(next_node) {
	this.dry.connect(next_node);
	this.wet.connect(next_node);
};

FX_Delay.prototype.getnode = function() {
	return this.dry;
};

///////////// FILTER /////////////////////
var CTL_Filter = function(ctx) {
	this.base_freq = 50;
	this.eg = 0;
	this.amount = 0.5;
	this.freq = Math.min(100, this.base_freq + this.eg * this.amount * 100);
	this.lowpass = ctx.createBiquadFilter();
	this.lowpass.type = "lowpass";
	this.lowpass.frequency.value = 300 + Math.pow(2.0, (this.freq + 30) / 10);
	this.lowpass.Q.value = 50 / 5;
};

CTL_Filter.prototype.set_on = function(val) {
	if (val > 0) {
		this.set_amount(10);
	} else {
		this.set_amount(0);
	}
}

CTL_Filter.prototype.set_freq = function(f) {
	this.base_freq = f;
	this.freq = Math.min(100, this.base_freq + this.eg * this.amount * 100);
	this.lowpass.frequency.value = 300 + Math.pow(2.0, (this.freq + 30) / 10);
};

CTL_Filter.prototype.set_q = function(q) {
	this.lowpass.Q.value = q / 5;
};

CTL_Filter.prototype.set_eg = function(val) {
	this.eg = val;
	this.freq = Math.min(100, this.base_freq + this.eg * this.amount * 100);
	this.lowpass.frequency.value = 300 + Math.pow(2.0, (this.freq + 30) / 10);
};

CTL_Filter.prototype.set_amount = function(val) {
	this.amount = val / 100;
	this.freq = Math.min(100, this.base_freq + this.eg * this.amount * 100);
	this.lowpass.frequency.value = 300 + Math.pow(2.0, (this.freq + 30) / 10);
};

CTL_Filter.prototype.connect = function(next_node) {
	this.lowpass.connect(next_node);
};

CTL_Filter.prototype.getnode = function() {
	return this.lowpass;
};


///////////// SYNTH MAIN /////////////////////
var WebSynth = function() {
	var self = this;

	this.context = new AudioContext();
	this.vco1 = new VCO(this.context);
	this.vco2 = new VCO(this.context);
	this.mixer = this.context.createScriptProcessor(stream_length, 1, 2);
	this.eg = new EG(function() {
		self.vco1.set_goal_pitch(self.goal_pitch1);
		self.vco2.set_goal_pitch(self.goal_pitch2);
	});
	this.feg = new EG();

	this.filter = new CTL_Filter(this.context);
	this.volume = new CTL_Volume(this.context);
	this.delay = new FX_Delay(this.context);

	// vco1 -> mixer -> filter -> volume -> delay -> dest
	// vco2 ->
	this.vco1.connect(this.mixer);
	this.vco2.connect(this.mixer);
	this.mixer.connect(this.filter.getnode());
	this.filter.connect(this.volume.getnode());
	this.volume.connect(this.delay.getnode());
	this.delay.connect(this.context.destination);

	this.mixer.onaudioprocess = function(event) {
		self.filter.set_eg(self.feg.gain);
		var sin = event.inputBuffer.getChannelData(0);
		var Lch = event.outputBuffer.getChannelData(0);
		var Rch = event.outputBuffer.getChannelData(1);
		var i;
		if (self.eg.mode == EGM.Idle) {
			for (i = 0; i < Lch.length; i++) {
				Lch[i] = 0;
				Rch[i] = 0;
			}
		} else {
			for (i = 0; i < Lch.length; i++) {
				Lch[i] = sin[i] * self.eg.gain;
				Rch[i] = Lch[i];
				self.eg.next();
				self.feg.next();
			}
		}
	};

};

WebSynth.prototype.play = function(n) {
	if(this.context.state === 'suspended') {
		this.context.resume();
	}
	this.eg.note_on();
	this.feg.note_on();
	var f1 = 440 * Math.pow(2.0, (this.vco1.oct + n + this.vco1.fine - 81.0) / 12.0);
	var f2 = 440 * Math.pow(2.0, (this.vco2.oct + n + this.vco2.fine - 81.0) / 12.0);
	if (f1 === f2) {
		f2 *= 1.002;
	}
	this.goal_pitch1 = f1;
	this.goal_pitch2 = f2;
};

WebSynth.prototype.stop = function() {
	this.eg.note_off();
	this.feg.note_off();
};

var synth = new WebSynth();

