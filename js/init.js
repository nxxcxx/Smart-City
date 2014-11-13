
	var container, stats;
	var scene, camera, cameraCtrl, renderer;
	var world = {};
	var screenWidth = window.innerWidth;
	var screenHeight = window.innerHeight;
	var dpr = 1.0;
	if (window.devicePixelRatio !== undefined) { dpr = window.devicePixelRatio; }

	var mouse = new THREE.Vector2(-1, -1);

	// ---- settings
		var scene_settings = {

			enableHelper: false,
			bgColor: 0x111113,
			enableShadow: true,
			shadowMapType: THREE.PCFSoftShadowMap,
			shadowMapSize: 4096,
			maxAnisotropy: null

		};


	// ---- Scene
		container = document.getElementById('canvas-container');
		scene = new THREE.Scene();

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
		renderer.setSize(window.innerWidth, window.innerHeight);
		
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
		var guiSky;

		gui.open();
		guiCtrl.open();
		guiViews.open(); 
		guiDebug.open();

		var debugInfo = $('.debug-info');
		var statsDOM = $('#stats');
		var toggleDebugInfo = {value: true};
		guiDebug.add(toggleDebugInfo, 'value').name('System Info').onChange( function(bool) {
			if (bool) {
				debugInfo.css('visibility', 'visible');
				statsDOM.css('visibility', 'visible');
			} else {
				debugInfo.css('visibility', 'hidden');
				statsDOM.css('visibility', 'hidden');
			}
		});

		guiDebug.add(scene_settings, 'enableHelper').name('Visual Helper').onChange( toggleHelper );

