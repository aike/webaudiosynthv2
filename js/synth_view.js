/*
 * synth_view.js
 *
 * This program is licensed under the MIT License.
 * Copyright 2015, aike (@aike1000)
 *
 */

var gui;
var stats;

$(function() {
	document.body.style.cursor = "default";

	gui = new ThreePiece('draw', 1100, 600, true);

	///////// Define Macros
	// screw
	gui.define('screw', {obj:'sphere', w:0.1, y:0.0, z:-6.5, col:0x222222});
	gui.define('screw2', {obj:'sphere', w:0.07, y:2.2, z:0.6, col:0x222222});
	// white key
	gui.define('whitekey', {obj:'group', z:2, rx:0, data:
		[{obj:'box', w:0.88, h:0.2, d:6.5, y:1.2, z:2.5, col:0xFFFFEE}]});
	// black key
	gui.define('blackkey', {obj:'group', y:0, z:3, rx:0, ry:0, data:
		[{obj:'extrude', shape:[[0,0],[0.4,0.95],[0.5,1],[1.8,0.9],[2.6,0.8],[3.5,0.7],[3.5,0]],
		 y:0.8, z:2.8, d:0.45, ry:Math.PI/2, col:0x000000}]});
	// knob
	gui.define('knob', {obj:'group', data:[
		{obj:'pointlight', y:1, distance:0.5, intensity:0, col:0x4444FF, name:"kl1"},
		{obj:'cylinder', radiustop:0.48, radiusbottom:0.5, h:0.5, segments:8, x:0, y:0.3, z:0, col:0x000000},
		{obj:'cylinder', radiustop:0.4, radiusbottom:0.6, h:0.1, x:0, y:0.1, z:0, col:0x000000},
		{obj:'circle', w:0.33, x:0, y:0.56, z:0, rx:-Math.PI/2, ry:0.0, tex:'metal'},
		{obj:'circle', w:0.04, x:0, y:0.56, z:-0.4, rx:-Math.PI/2, ry:0.0, col:0xffffff}]});
	gui.define('chickenknob', {obj:'group', data:[
		{obj:'pointlight', y:1, distance:0.5, intensity:0, col:0x4444FF, name:"kl1"},
		{obj:'extrude', d:0.5, x:-0.25, y:0, z:0.6, rx:-Math.PI/2,
		shape:[[0,0],[0.2,1.2],[0.3,1.2],[0.5,0]],
		col:0x000000},
		{obj:'cylinder', radiustop:0.25, radiusbottom:0.45, h:0.5, x:0, y:0.3, z:0, col:0x000000},
		{obj:'cylinder', radiustop:0.4, radiusbottom:0.6, h:0.1, x:0, y:0.1, z:0, col:0x000000},
		{obj:'circle', w:0.2, x:0, y:0.56, z:0, rx:-Math.PI/2, ry:0.0, tex:'metal'},
		{obj:'plane', w:0.02, h:0.34, x:0, y:0.51, z:-0.42, rx:-Math.PI/2, ry:0.0, col:0xffffff}
		]});
	// switch
	gui.define('switch', {obj:'group', data:[
		{obj:'pointlight', x:1, y:2, z:0, distance:0.5, intensity:0, col:0x4444FF, name:"kl1"},
		{obj:'extrude', scale:1, d:0.4, y:-0.4, rz:-0.4,
			shape:[[0,0],[0,0.5],[0.08,1],[0.55,0.8],[1.02,1],[1.1,0.5],[1.1,0]],col:0x6994A7}
		]});


	//////////// Define Objects
	var objects = {
		scale: 0.15,
		data:[
		{obj:'texture', name:'wood', file:'images/wood.jpg'},
		{obj:'texture', name:'panel', file:'images/panel.jpg'},
		{obj:'texture', name:'leftpanel', file:'images/leftpanel.jpg'},
		{obj:'texture', name:'metal', file:'images/metal.png'},
		{obj:'texture', name:'logo', file:'images/logoplate.jpg'},

		// camera
		{obj:'perspectivecamera', y:2, fov:50},

		// light
		{obj:'directionalLight', intensity:0, name:'dlight'}, 
		{obj:'hemisphereLight', intensity:0.1},
		{obj:'spotLight', col:0xFFFFF8, intensity:1.5, x:10, y:10, z:-5, tx:0, ty:0, tz:0},

		// bottom board
		{obj:'box', w:28.25 - 0.5*2, h:0.5, d:16.0 - 0.5*2, y:-2.5, col:0x000000},
		// far side board
		{obj:'box', w:28.25 - 0.5*2, h:2.5, d:0.5, y:-1.5, z:-7.6, tex:'wood'},
		// near side board
		{obj:'box', w:28.25 - 0.5*2, h:2.8, d:0.6, y:-1.4, z:7.5, tex:'wood'},
		// left board
		{obj:'extrude', x:-13.3, y:-2.75, z:-8, ry:-Math.PI/2,
			shape:[[0,0],[0,5],[8.5,5],[16,3.5],[16,0]], d:0.5, tex:'wood'},
		// right board
		{obj:'extrude', x:13.9, y:-2.75, z:-8, ry:-Math.PI/2,
			shape:[[0,0],[0,5],[8.5,5],[16,3.5],[16,0]], d:0.5, tex:'wood'},
		// front board
		{obj:'box', w:26.8, h:0.3, d:3, y:1.9, z:1.3, rx:0.2, tex:'wood'},
		{obj:'plane', w:3.4, h:1.7, x:11, y:2.1, z:1.3, rx:-Math.PI/2+0.2, tex:'logo', name:'logo'},
		{obj:'screw2', x:9.4},
		{obj:'screw2', x:12.6},
		{obj:'screw2', x:9.4, y:1.93, z:2.0},
		{obj:'screw2', x:12.6, y:1.93, z:2.0},

		// side panel
		{obj:'box', w:3, h:2, d:7, x:-11.8, y:0.2, z:3.5, tex:'leftpanel'},
		{obj:'switch', x:-12.1, z:3.3, y:1.2, col:0xEEEECC, name:'s_glide'},
		{obj:'group', name:'b_start', data:[
			{obj:'pointlight', x:-11.8, y:1.6, z:5.5, distance:0.4, intensity:0, col:0xAA6600},
			{obj:'box', w:1.2, h:1, d:1, x:-11.8, y:1.0, z:5.5, col:0xAA4444}]},

		// side panel wood
		{obj:'box', w:3, h:2, d:0.15, x:-11.8, y:0.17, z:7.1, tex:'wood'},

		// panel
		{obj:'group', x:0, y:2.5, z:-0.9, rx:0, name:'panel',
			data:[
			{obj:'box', w:26.5, h:0.5, d:1, x:0, y:-0.2, z:-6.8, tex:'wood'},
			{obj:'screw', x:-10},
			{obj:'screw', x: -3},
			{obj:'screw', x:  3},
			{obj:'screw', x: 10},
			{obj:'plane', w:26.5, h:7, x:0, y:0.01, z:-2.9, rx:-Math.PI/2, ry:0.0, tex:'panel'},
			{obj:'box', w:26.6, h:0.2, d:7, x:0, y:-0.2, z:-2.9, col:0x444444},
			{obj:'box', w:24, h:3, d:6, x:0, y:-1.8, z:-2.9, col:0x444444},

			{obj:'knob', x:-11.3, z:-3, name:'k_glide'},

			{obj:'chickenknob', x:-8.2, z:-4.3, name:'c_freq1'},
			{obj:'knob', x:-5.9, z:-4.3, name:'k_fine1'},
			{obj:'chickenknob', x:-3.4, z:-4.3, name:'c_wave1'},
			{obj:'chickenknob', x:-8.2, z:-1.45, name:'c_freq2'},
			{obj:'knob', x:-5.9, z:-1.45, name:'k_fine2'},
			{obj:'chickenknob', x:-3.4, z:-1.45, name:'c_wave2'},

			{obj:'knob', x:-0.35, z:-4.3, name:'k_vol1'},
			{obj:'switch', x:1, z:-4.5, name:'s_osc1'},
			{obj:'knob', x:-0.35, z:-1.45, name:'k_vol2'},
			{obj:'switch', x:1, z:-1.65, name:'s_osc2'},

			{obj:'knob', x:4.1, z:-4.76, scale:0.95, name:'k_cut'},
			{obj:'knob', x:6.4, z:-4.76, scale:0.95, name:'k_emp'},
			{obj:'knob', x:8.6, z:-4.76, scale:0.95, name:'k_amo'},
			{obj:'knob', x:4.1, z:-3.00, scale:0.95, name:'k_fa'},
			{obj:'knob', x:6.4, z:-3.00, scale:0.95, name:'k_fd'},
			{obj:'knob', x:8.6, z:-3.00, scale:0.95, name:'k_fs'},
			{obj:'knob', x:4.1, z:-0.75, scale:0.95, name:'k_la'},
			{obj:'knob', x:6.4, z:-0.75, scale:0.95, name:'k_ld'},
			{obj:'knob', x:8.6, z:-0.75, scale:0.95, name:'k_ls'},

			{obj:'knob', x:11.58, z:-4.3, name:'k_vol'},
			{obj:'knob', x:11.58, z:-1.43, name:'k_dly'},
			]},

		{obj:'arealight'},
		{obj:'ground', y:-5.5/2}
	]};

	/////////////// Define keyboard objects and callbacks
	var keys = {obj:'group', data:[]};
	var n = 41;
	var x = -10.6;
	for (var i = 0; i < 44; i++) {
		(function(note) {
			var id = 'key' + n;
			if (ctrl.isWhiteKey(note)) {
				if (ctrl.isWhiteKey(note - 1)) {
					x += 0.9;
				} else {
					x += 0.7;
				}
				keys.data.push({obj:'whitekey', x:x, name:id});
				gui.setMouseEnterCallback(id, function(o) {
					ctrl.focus = id;
				});
				gui.setMouseLeaveCallback(id, function(o) {
					ctrl.focus = '';
				});
			} else {
				var offset = 0;
				switch (i % 12) {
					case 1: offset = -0.08; break;
					case 3: offset =  0.0; break;
					case 5: offset =  0.08; break;
					case 8: offset = -0.08; break;
					case 10: offset =  0.08; break;
				}
				x += 0.2;
				keys.data.push({obj:'blackkey', x:x + offset, name:id});
				gui.setMouseEnterCallback(id, function(o) {
					ctrl.focus = id;
				});
				gui.setMouseLeaveCallback(id, function(o) {
					ctrl.focus = '';
				});
			}
		})(n);
		n++;
	}

	objects.data.push(keys);


	/////////////// Define Knob Callback
	var knobs = [
		's_glide', 'k_glide', 'c_freq1', 'k_fine1', 'c_wave1', 'c_freq2', 'k_fine2',
		'c_wave2', 'k_vol1', 's_osc1', 'k_vol2', 's_osc2', 'k_cut', 'k_emp', 'k_amo',
		'k_fa', 'k_fd', 'k_fs', 'k_la', 'k_ld', 'k_ls', 'k_vol', 'k_dly', 'b_start'];
	for (knob in knobs) {
		(function(name) {
			gui.setMouseEnterCallback(name, function(o) {
				if (ctrl.mouseDown) return;
				o.parent.children[0].intensity = 5;
				ctrl.focus = name;
				gui.setDirty();
			});
			gui.setMouseLeaveCallback(name, function(o) {
				if (ctrl.mouseDown) return;
				ctrl.focus = '';
				o.children[0].intensity = 0;
				gui.setDirty();
			});
		})(knobs[knob]);
	}

	// logo panel 
	gui.setMouseEnterCallback('logo', function(o) {
		if (ctrl.mouseDown) return;
		ctrl.focus = 'logo';
	});
	gui.setMouseLeaveCallback('logo', function(o) {
		if (ctrl.mouseDown) return;
		ctrl.focus = '';
	});

	gui.eval(objects);

	// show frame rate
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '10px';
	stats.domElement.style.right = '15px';
	gui.element.appendChild(stats.domElement);
	gui.addHook(function() { stats.update(); });
	stats.domElement.style.display = 'none';
	///////////////////////////////////


	gui.enableMouseEvent(true);

	// panel raise animation
	if (true) {
		gui.addHook(function(msec) {
			if (gui.obj('panel').rotation.x < 0.9) {
				gui.obj('panel').rotation.x += 0.01;
				gui.setDirty();
			}
			if (gui.obj('dlight').intensity < 0.8) {
				gui.obj('dlight').intensity += 0.01;
				gui.setDirty();
			}
		});
	} else {
		gui.obj('panel').rotation.x = 1.0
		gui.obj('dlight').intensity = 0.8;
	}

	gui.obj('camera').position.y += 0.6;
	gui.obj('camera').position.z -= 0.4;
	gui.obj('camera').rotation.x -= 0.15;

	ctrl.setDefaultValues();

	// resize callback
	var fitToWindow = function() {
		var w = window.innerWidth;
		var h = window.innerHeight;
		if (w / h > 11 / 6) {
			w = Math.floor(h * 11 / 6);
		} else {
			h = Math.floor(w * 6 / 11);
		}
		gui.resize(w, h);
		gui.setDirty();
	}
	fitToWindow();

	window.addEventListener('resize', function() {
		fitToWindow();
	}, false );
});
