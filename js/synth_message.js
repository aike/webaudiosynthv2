/*
 * synth_message.js
 *
 * This program is licensed under the MIT License.
 * Copyright 2012-2015, aike (@aike1000)
 *
 */

window.addEventListener("message", webMidiLinkRecv, false);
function webMidiLinkRecv(event) {
	var msg = event.data.split(",");
	switch (msg[0]) {
		case "link":  //Level1 messages
			switch (msg[1]) {
				case "reqpatch":
					event.source.postMessage("link,patch," + GetPatchString(), "*");
					break;
				case "setpatch":
					SetPatchString(msg[2]);
					break;
			}
			break;
		case "midi":
			switch (parseInt(msg[1], 16) & 0xf0) {
				case 0x80:
					ctrl.note_off(parseInt(msg[2], 16));
					break;
				case 0x90:
					var velo = parseInt(msg[3], 16);
					if (velo > 0)
						ctrl.note_on(parseInt(msg[2], 16));
					else
						ctrl.note_off(parseInt(msg[2], 16));
					break;
				case 0xb0:
					if (parseInt(msg[2], 16) == 0x78) {
						ctrl.all_note_off();
					}
					break;
			}
			break;
	}
};

function GetPatchString() {
	var s = '';
	s = s + ctrl.getKnobValue(gui.obj('k_glide')) + '/';
	s = s + ctrl.getSwitchValue(gui.obj('s_glide')) + '/';
	s = s + ctrl.getKnobValue(gui.obj('c_freq1')) + '/';
	s = s + ctrl.getKnobValue(gui.obj('c_freq2')) + '/';
	s = s + ctrl.getKnobValue(gui.obj('k_fine1')) + '/';
	s = s + ctrl.getKnobValue(gui.obj('k_fine2')) + '/';
	s = s + ctrl.getKnobValue(gui.obj('c_wave1')) + '/';
	s = s + ctrl.getKnobValue(gui.obj('c_wave2')) + '/';
	s = s + ctrl.getKnobValue(gui.obj('k_vol1')) + '/';
	s = s + ctrl.getKnobValue(gui.obj('k_vol2')) + '/';
	s = s + ctrl.getSwitchValue(gui.obj('k_osc1')) + '/';
	s = s + ctrl.getSwitchValue(gui.obj('k_osc2')) + '/';
	s = s + ctrl.getKnobValue(gui.obj('k_cut')) + '/';
	s = s + ctrl.getKnobValue(gui.obj('k_emp')) + '/';
	s = s + ctrl.getKnobValue(gui.obj('k_amo')) + '/';
	s = s + ctrl.getKnobValue(gui.obj('k_fa')) + '/';
	s = s + ctrl.getKnobValue(gui.obj('k_fd')) + '/';
	s = s + ctrl.getKnobValue(gui.obj('k_fs')) + '/';
	s = s + ctrl.getKnobValue(gui.obj('k_la')) + '/';
	s = s + ctrl.getKnobValue(gui.obj('k_ld')) + '/';
	s = s + ctrl.getKnobValue(gui.obj('k_ls')) + '/';
	s = s + ctrl.getKnobValue(gui.obj('k_vol')) + '/';
	s = s + ctrl.getKnobValue(gui.obj('k_dly')) + '/';
	return s;
};

function SetPatchString(s) {

	var a = s.split('/');

	ctrl.setSwitchValue(gui.obj('s_glide'), parseInt(a[0], 10));
	ctrl.setDspParam('s_glide', parseInt(a[0], 10));

	ctrl.setKnobValue(gui.obj('k_glide'), parseInt(a[1], 10));
	ctrl.setDspParam('s_glide', parseInt(a[1], 10));

	ctrl.normalKnob = false;
	ctrl.setKnobValue(gui.obj('c_freq1'), parseInt(a[2], 10));
	ctrl.setDspParam('c_freq1', parseInt(a[2], 10));

	ctrl.setKnobValue(gui.obj('c_freq2'), parseInt(a[3], 10));
	ctrl.setDspParam('c_freq2', parseInt(a[3], 10));

	ctrl.normalKnob = true;
	ctrl.setKnobValue(gui.obj('k_fine1'), parseInt(a[4], 10));
	ctrl.setDspParam('k_fine1', parseInt(a[4], 10));

	ctrl.setKnobValue(gui.obj('k_fine2'), parseInt(a[5], 10));
	ctrl.setDspParam('k_fine2', parseInt(a[5], 10));

	ctrl.normalKnob = false;
	ctrl.setKnobValue(gui.obj('c_wave1'), parseInt(a[6], 10));
	ctrl.setDspParam('c_wave1', parseInt(a[6], 10));

	ctrl.setKnobValue(gui.obj('c_wave2'), parseInt(a[7], 10));
	ctrl.setDspParam('c_wave2', parseInt(a[7], 10));

	ctrl.normalKnob = true;
	ctrl.setKnobValue(gui.obj('k_vol1'), parseInt(a[8], 10));
	ctrl.setDspParam('k_vol1', parseInt(a[8], 10));

	ctrl.setKnobValue(gui.obj('k_vol2'), parseInt(a[9], 10));
	ctrl.setDspParam('k_vol2', parseInt(a[9], 10));

	ctrl.setSwitchValue(gui.obj('s_osc1'), parseInt(a[10], 10));
	ctrl.setDspParam('s_osc1', parseInt(a[10], 10));

	ctrl.setSwitchValue(gui.obj('s_osc2'), parseInt(a[11], 10));
	ctrl.setDspParam('s_osc2', parseInt(a[11], 10));

	ctrl.setKnobValue(gui.obj('k_cut'), parseInt(a[12], 10));
	ctrl.setDspParam('k_cut', parseInt(a[12], 10));

	ctrl.setKnobValue(gui.obj('k_emp'), parseInt(a[13], 10));
	ctrl.setDspParam('k_emp', parseInt(a[13], 10));

	ctrl.setKnobValue(gui.obj('k_amo'), parseInt(a[14], 10));
	ctrl.setDspParam('k_amo', parseInt(a[14], 10));

	ctrl.setKnobValue(gui.obj('k_fa'), parseInt(a[15], 10));
	ctrl.setDspParam('k_fa', parseInt(a[15], 10));

	ctrl.setKnobValue(gui.obj('k_fd'), parseInt(a[16], 10));
	ctrl.setDspParam('k_fd', parseInt(a[16], 10));

	ctrl.setKnobValue(gui.obj('k_fs'), parseInt(a[17], 10));
	ctrl.setDspParam('k_fs', parseInt(a[17], 10));

	ctrl.setKnobValue(gui.obj('k_la'), parseInt(a[18], 10));
	ctrl.setDspParam('k_la', parseInt(a[18], 10));

	ctrl.setKnobValue(gui.obj('k_ld'), parseInt(a[19], 10));
	ctrl.setDspParam('k_ld', parseInt(a[19], 10));

	ctrl.setKnobValue(gui.obj('k_ls'), parseInt(a[20], 10));
	ctrl.setDspParam('k_ls', parseInt(a[20], 10));

	ctrl.setKnobValue(gui.obj('k_vol'), parseInt(a[21], 10));
	ctrl.setDspParam('k_vol', parseInt(a[21], 10));

	ctrl.setKnobValue(gui.obj('k_dly'), parseInt(a[22], 10));
	ctrl.setDspParam('k_dly', parseInt(a[22], 10));
};

function LinkReady() {
	if (window.opener) {
		window.opener.postMessage("link,ready", "*");
	} else {
		window.parent.postMessage("link,ready", "*");
	}
};

LinkReady();
