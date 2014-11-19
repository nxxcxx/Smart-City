
	var container, stats;
	var scene, camera, cameraCtrl, renderer;
	var world = {};
	var screenWidth = window.innerWidth;
	var screenHeight = window.innerHeight;

	var mouse = new THREE.Vector2(-1, -1);

	// ---- Scene
		container = document.getElementById('canvas-container');
		scene = new THREE.Scene();

		scene.fog = new THREE.Fog( 0x333344, 10, 100000 );


	// ---- Camera
		// z-near too low will cause artifact when viewing from far distance
		camera = new THREE.PerspectiveCamera(80, window.innerWidth/window.innerHeight, 10.0, 2000000);
		// -- camera orbit control
		cameraCtrl = new THREE.OrbitControls(camera, container);
		cameraCtrl.object.position.set(-3000, 2000, 0);
		cameraCtrl.update();

	// ---- Renderer
		renderer = new THREE.WebGLRenderer({ antialias: true , alpha: true});
		renderer.setClearColor(scene_settings.bgColor, 1);
		renderer.setSize(screenWidth, screenHeight);

			renderer.autoClear = false;
		
		renderer.shadowMapEnabled = scene_settings.enableShadow;
		renderer.shadowMapType = scene_settings.shadoyMapType;

		scene_settings.maxAnisotropy = scene_settings.maxAnisotropy || renderer.getMaxAnisotropy();


		container.appendChild(renderer.domElement);

	// ---- Stats
		stats = new Stats();
		container.appendChild( stats.domElement );
		// disable graph
		// document.getElementById('fpsGraph').style.display = 'none';


	// ---- grid & axis helper
		var grid = new THREE.GridHelper(4000, 500);
		grid.setColors(0xff8800, 0x000000);
		grid.material.opacity = 0.7;
		grid.material.transparent = true;
		grid.position.y = -300;
		scene.add(grid);

		var axisHelper = new THREE.AxisHelper(1000);
		axisHelper.position.y = 1000;
		scene.add(axisHelper);


	// ---- GUI initial setup

		var gui = new dat.GUI();
		var guiCtrl = gui.addFolder('Controls');
		var guiViews = guiCtrl.addFolder('Views');
		var guiDebug = gui.addFolder('Debug');
		var guiGeneral = guiDebug.addFolder('General');
		var guiPP = guiDebug.addFolder('Post-Processing');
		var guiSky, guiOcean;

		gui.close();

		guiCtrl.open();
		guiViews.open(); 
		guiDebug.open();


	// ---- Status Bar

		var debugInfo = $('.debug-info');
		var statsDOM = $('#stats');

		guiGeneral.add(scene_settings, 'enableStats').name('FPS').onChange( function(bool) {
			statsDOM.css('visibility', bool ? 'visible':'hidden'); 
		});
		guiGeneral.add(scene_settings, 'enableInfoBar').name('Status').onChange( function(bool) {

			debugInfo.css('visibility', bool ? 'visible':'hidden');

		});

		guiGeneral.add(scene_settings, 'enableHelper').name('Visual Helper').onChange( toggleHelper );


		var debugCTGT = $('.ctgt');
		var debugCPOS = $('.cpos');
		var debugFOV  = $('.fov');
		var debugGL = $('.debug-gl');

		function initDebugInfo() {

			var gl = renderer.getContext();

			var report = {

				// General
				Platform: navigator.platform,
				Version: gl.getParameter(gl.VERSION),
				ShadingLanguage: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
				Vendor: gl.getParameter(gl.VENDOR),
				Renderer: gl.getParameter(gl.RENDERER),
				unMaskedVendor: getUnmaskedInfo(gl).vendor,
        		unMaskedRenderer: getUnmaskedInfo(gl).renderer,

        		Antialias: gl.getContextAttributes().antialias ? 'Available' : 'Not available',

				// Texture
				maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
				maxCubeMapTextureSize: gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE),
				maxAnisotropy: renderer.getMaxAnisotropy(),

			};

			console.log(report);

			var reportConcat = '';


			_.each(report, function (value, key) {

				reportConcat += key + ': ' + value + ' | ';

			});


			debugGL.html(reportConcat);

			function getUnmaskedInfo(gl) {
				var unMaskedInfo = {
					renderer: '',
					vendor: ''
				};
				
				var dbgRenderInfo = gl.getExtension("WEBGL_debug_renderer_info");
				if (dbgRenderInfo !== null) {
					unMaskedInfo.renderer = gl.getParameter(dbgRenderInfo.UNMASKED_RENDERER_WEBGL);
					unMaskedInfo.vendor   = gl.getParameter(dbgRenderInfo.UNMASKED_VENDOR_WEBGL);
				}
				
				return unMaskedInfo;
			}

		} // end fn initDebugInfo


		function updateDebugCamera() {
			if (!scene_settings.enableInfoBar) return;
			var tgt = cameraCtrl.target;
			var pos = cameraCtrl.object.position;
			debugCTGT.html( 'CTGT: ' + tgt.x.toFixed(2) + ', '+ tgt.y.toFixed(2) + ', ' + tgt.z.toFixed(2) );
			debugCPOS.html( 'CPOS: ' + pos.x.toFixed(2) + ', ' + pos.y.toFixed(2) + ', ' + pos.z.toFixed(2) );
			debugFOV.html( 'CFOV: ' + camera.fov.toFixed(2) );
		}