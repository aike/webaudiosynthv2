/*
 * synth_controller.js
 *
 * This program is licensed under the MIT License.
 * Copyright 2015, aike (@aike1000)
 *
 */

var ctrl;

var Ctrl = function() {
	this.focus = '';
	this.blinkStartButton = null;
	this.mouseDown = false;
	this.sx = 0;
	this.sy = 0;
	this.knob = null;
	this.knobVal = 0;
	this.note = null;
	this.normalKnob = true;
	this.sensitivity = 2;
	this.infomode = 0;

	var self = this;
	document.body.onmousedown = function(e) {
		if (self.mouseDown) return;
		if (self.focus.substring(0, 2) === 'k_') {
			self.mouseDown = true;
			self.sx = e.clientX;
			self.sy = e.clientY;
			self.knob = gui.obj(self.focus);
			self.normalKnob = true;
			self.knobVal = self.getKnobValue(self.knob);

		} else if (self.focus.substring(0, 2) === 'c_') {
			self.mouseDown = true;
			self.sx = e.clientX;
			self.sy = e.clientY;
			self.knob = gui.obj(self.focus);
			self.normalKnob = false;
			self.knobVal = self.getKnobValue(self.knob);

		} else if (self.focus.substring(0, 2) === 's_') {
			var o = gui.obj(self.focus);
			self.toggleSwitch(o);
			self.setDspParam(self.focus, self.getSwitchValue(o));

		} else if (self.focus.substring(0, 3) === 'key') {
			self.note = parseInt(self.focus.substring(3), 10);
			self.note_on(self.note);

		} else if (self.focus === 'b_start') {
			if (!sequencer.playing) {
				self.play_demo();
			} else {
				self.stop_demo();
			}

		} else if (self.focus === 'logo') {
			self.infomode = (self.infomode + 1) % 3;
			switch (self.infomode) {
				case 0:
					stats.domElement.style.display = 'none';
					document.getElementById('buttons').style.display = 'block';
					break;
				case 1:
					stats.domElement.style.display = 'block';
					document.getElementById('buttons').style.display = 'none';
					break;
				case 2:
					stats.domElement.style.display = 'none';
					document.getElementById('buttons').style.display = 'none';
					break;
			}

		}
	};
	document.body.onmousemove = function(e) {
		if (!self.mouseDown) return;
		ex = e.clientX;
		ey = e.clientY;
		var diff = Math.floor((self.sy - ey) * self.sensitivity);
		var val = self.knobVal + diff;
		if (val > 100) val = 100;
		else if (val < 0) val = 0;
		self.setKnobValue(self.knob, val);
		gui.setDirty();
		self.setDspParam(self.focus, val);
	};
	document.body.onmouseup = function(e) {
		ex = e.clientX;
		ey = e.clientY;
		self.mouseDown = false;
		if (self.focus !== '') {
			if (self.focus.substring(0, 3) === 'key') {
				self.note_off(self.note);
			}
			if ((self.focus.substring(0, 2) === 'k_') || (self.focus.substring(0, 2) === 'c_')) {
				gui.obj(self.focus).children[0].intensity = 0;
				self.focus = '';
				gui.setDirty();
			}
		}
	};
}

Ctrl.prototype.setDspParam = function(key, val) {
	switch (key) {
	case 's_glide':
		synth.vco1.set_glide_on(val);
		synth.vco2.set_glide_on(val);
		break;
	case 'k_glide':
		synth.vco1.set_glide_time(val);
		synth.vco2.set_glide_time(val);
		break;

	case 'c_freq1':
		synth.vco1.set_pitch(val);
		break;
	case 'c_freq2':
		synth.vco2.set_pitch(val);
		break;
	case 'k_fine1':
		synth.vco1.set_fine(val);
		break;
	case 'k_fine2':
		synth.vco2.set_fine(val);
		break;
	case 'c_wave1':
		synth.vco1.set_wave(val);
		break;
	case 'c_wave2':
		synth.vco2.set_wave(val);
		break;

	case 'k_vol1':
		synth.vco1.set_gain(val);
		break;
	case 's_osc1':
		synth.vco1.set_on(val);
		break;
	case 'k_vol2':
		synth.vco2.set_gain(val);
		break;
	case 's_osc2':
		synth.vco2.set_on(val);
		break;
	case 'k_cut':
		synth.filter.set_freq(val);
		break;
	case 'k_emp':
		synth.filter.set_q(val);
		break;
	case 'k_amo':
		synth.filter.set_amount(val);
		break;
	case 'k_fa':
		synth.feg.set_a(val);
		break;
	case 'k_fd':
		synth.feg.set_d(val);
		synth.feg.set_r(val);
		break;
	case 'k_fs':
		synth.feg.set_s(val);
		break;
	case 'k_la':
		synth.eg.set_a(val);
		break;
	case 'k_ld':
		synth.eg.set_d(val);
		synth.eg.set_r(val);
		break;
	case 'k_ls':
		synth.eg.set_s(val);
		break;
	case 'k_vol':
		synth.volume.set(val);
		break;
	case 'k_dly':
		synth.delay.set(val);
		break;
	}
}


Ctrl.prototype.getKnobValue = function(o) {
	if (this.normalKnob) {
		return Math.floor(100 * (2.2 - o.rotation.y) / 4.4);
	} else {
		return Math.floor(100 * (1 - o.rotation.y) / 2);
	}
}

Ctrl.prototype.setKnobValue = function(o, val) {
	if (this.normalKnob) {	// 101 step normal knob
		if (val > 100) val = 100;
		else if (val < 0) val = 0;
		var angle = 2.2 - (val / 100 * 4.4);

	} else { // 3 step chicken knob
		if (val > 66) val = 100;
		else if (val > 33) val = 50;
		else val = 0;
		var angle = 1 - (val / 100 * 2);
	}
	o.rotation.y = angle;
	gui.setDirty();
}

Ctrl.prototype.toggleSwitch = function(o) {
	if (this.getSwitchValue(o) > 0) {
		this.setSwitchValue(o, 0);
	} else {
		this.setSwitchValue(o, 100);
	}
	gui.setDirty();
}

Ctrl.prototype.getSwitchValue = function(o) {
	var val;
	if (o.rotation.z === -0.4) {
		val = 100;
	} else {
		val = 0;
	}
	return val;
}

Ctrl.prototype.setSwitchValue = function(o, val) {
	var c = o.children[1];
	if (val > 0) {
		c.rotation.z = -0.4;
		c.position.y = -0.4;
		c.position.x = 0;
	} else {
		c.rotation.z = 0.4;
		c.position.y = -0.8;
		c.position.x = 0.4;
	}
	gui.setDirty();
}

Ctrl.prototype.getSwitchValue = function(o) {
	var c = o.children[1];
	if (c.rotation.z === -0.4) {
		return 100;
	} else {
		return 0;
	}
}

Ctrl.prototype.isWhiteKey = function(note) {
	switch (note % 12) {
		case  0: return true;
		case  1: return false; 
		case  2: return true;
		case  3: return false;
		case  4: return true;
		case  5: return true;
		case  6: return false;
		case  7: return true;
		case  8: return false;
		case  9: return true;
		case 10: return false;
		case 11: return true;
	}
}

Ctrl.prototype.keyDown = function(note) {
	var o = gui.obj('key' + note);
	if (!o) {
		return;
	}
	if (this.isWhiteKey(note)) {
		o.rotation.x = 0.05;
		o.position.y = -0.2;
		o.position.z = 2.1;
	} else {
		o.rotation.x = 0.1;
		o.position.y = -0.2;
	}
	gui.setDirty();
}

Ctrl.prototype.keyUp = function(note) {
	var o = gui.obj('key' + note);
	if (!o) {
		return;
	}
	if (this.isWhiteKey(note)) {
		o.rotation.x = 0;
		o.position.y = 0;
		o.position.z = 2;
	} else {
		o.rotation.x = 0;
		o.position.y = 0;
	}
	gui.setDirty();
}

Ctrl.prototype.note_on = function(note) {
	synth.play(note);
	ctrl.keyDown(note);
};

Ctrl.prototype.note_off = function(note) {
	synth.stop();
	ctrl.keyUp(note);
};

Ctrl.prototype.all_note_off = function() {
	synth.stop();
	for (var i = 41; i <= 84; i++) {
		this.keyUp(i);
	}
};

Ctrl.prototype.play_demo = function() {
	sequencer.play();
	gui.obj('b_start').position.y = -0.1;
	var o = gui.obj('b_start').children[0];
	this.blinkStartButton = setInterval(function() {
		o.intensity = (o.intensity === 3) ? 5: 3;
		gui.setDirty();
	}, 500);
};

Ctrl.prototype.stop_demo = function(wait_release) {
	sequencer.stop();
	var self = this;
	var wait;
	if (wait_release) {
		wait = 2000;
	} else {
		wait = 0;
	}
	setTimeout(function() {
		clearInterval(self.blinkStartButton);
		var o = gui.obj('b_start');
		o.position.y = 0;
		o.children[0].intensity = 0;
		gui.setDirty();		
	}, wait);
};

Ctrl.prototype.setDefaultValues = function() {
	this.setSwitchValue(gui.obj('s_glide'), 100);
	this.setDspParam('s_glide', 100);

	this.setKnobValue(gui.obj('k_glide'), 20);
	this.setDspParam('s_glide', 20);

	this.normalKnob = false;
	this.setKnobValue(gui.obj('c_freq1'), 0);
	this.setDspParam('c_freq1', 0);

	this.setKnobValue(gui.obj('c_freq2'), 50);
	this.setDspParam('c_freq2', 50);

	this.normalKnob = true;
	this.setKnobValue(gui.obj('k_fine1'), 50);
	this.setDspParam('k_fine1', 50);

	this.setKnobValue(gui.obj('k_fine2'), 50);
	this.setDspParam('k_fine2', 50);

	this.normalKnob = false;
	this.setKnobValue(gui.obj('c_wave1'), 50);
	this.setDspParam('c_wave1', 50);

	this.setKnobValue(gui.obj('c_wave2'), 50);
	this.setDspParam('c_wave2', 50);

	this.normalKnob = true;
	this.setKnobValue(gui.obj('k_vol1'), 50);
	this.setDspParam('k_vol1', 50);

	this.setKnobValue(gui.obj('k_vol2'), 50);
	this.setDspParam('k_vol2', 50);

	this.setSwitchValue(gui.obj('s_osc1'), 100);
	this.setDspParam('s_osc1', 100);

	this.setSwitchValue(gui.obj('s_osc2'), 100);
	this.setDspParam('s_osc2', 100);

	this.setKnobValue(gui.obj('k_cut'), 50);
	this.setDspParam('k_cut', 50);

	this.setKnobValue(gui.obj('k_emp'), 50);
	this.setDspParam('k_emp', 50);

	this.setKnobValue(gui.obj('k_amo'), 50);
	this.setDspParam('k_amo', 50);

	this.setKnobValue(gui.obj('k_fa'), 20);
	this.setDspParam('k_fa', 20);

	this.setKnobValue(gui.obj('k_fd'), 10);
	this.setDspParam('k_fd', 10);

	this.setKnobValue(gui.obj('k_fs'), 50);
	this.setDspParam('k_fs', 50);

	this.setKnobValue(gui.obj('k_la'), 10);
	this.setDspParam('k_la', 10);

	this.setKnobValue(gui.obj('k_ld'), 20);
	this.setDspParam('k_ld', 20);

	this.setKnobValue(gui.obj('k_ls'), 100);
	this.setDspParam('k_ls', 100);

	this.setKnobValue(gui.obj('k_vol'), 50);
	this.setDspParam('k_vol', 50);

	this.setKnobValue(gui.obj('k_dly'), 40);
	this.setDspParam('k_dly', 40);
}

$(function() {
	ctrl = new Ctrl();
});


