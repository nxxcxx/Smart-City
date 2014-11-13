
	var container, stats;
	var scene, light, camera, cameraCtrl, renderer;
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
		renderer.shadowMapType = THREE.PCFSoftShadowMap;

		scene_settings.maxAnisotropy = renderer.getMaxAnisotropy();


		container.appendChild(renderer.domElement);

	// ---- Stats
		stats = new Stats();
		container.appendChild( stats.domElement );
		// disable graph
		// document.getElementById('fpsGraph').style.display = 'none';


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

	// ---- Lights


		var SHADOW_MAP_WIDTH = 4096, SHADOW_MAP_HEIGHT = 4096;

		// sun light
		var sunLight = new THREE.DirectionalLight(0xffffff, 1.0);	//0x331100

		// sunlight pos now control by sky
		// var sunLightDir = new THREE.Vector3(-4000, 3000, 3000);
		// var sunLightDist = 1000;
		// sunLight.position.set( sunLightDir.normalize().multiplyScalar(sunLightDist) );

			sunLight.castShadow = true;

			sunLight.shadowCameraNear = 8000;
			sunLight.shadowCameraFar = 12000;

			sunLight.shadowCameraLeft = -2000;
			sunLight.shadowCameraRight = 2000;
			sunLight.shadowCameraTop = 2000;
			sunLight.shadowCameraBottom = -2000;

			sunLight.shadowCameraVisible = true;

			sunLight.shadowCameraFov = 80;
			sunLight.shadowBias = 0.0001;
			sunLight.shadowDarkness = 0.77;

			sunLight.shadowMapWidth = SHADOW_MAP_WIDTH;
			sunLight.shadowMapHeight = SHADOW_MAP_HEIGHT;

			var sunLightColor = {color: '#ffffff'};
			var guiSunlight = guiDebug.addFolder('Sunlight');
			guiSunlight.add(sunLight, 'intensity', 0.0, 2.0, 0.1);
			guiSunlight.addColor(sunLightColor, 'color').name('color').onChange(updateLightCol);
			function updateLightCol(c) {
				sunLight.color.set(c);
			}


		scene.add(sunLight);

		// front light
		// var frontLight = new THREE.DirectionalLight(0xffffff, 1.0);	//0x331100
		// frontLight.position.set(-4000, 3000, 3000);
		// scene.add(frontLight);

		// // back light
		backLight = new THREE.DirectionalLight(0xffffff, 0.5);
		backLight.position.set(1000, 1000, -1500);

			// backLight.castShadow = true;

			backLight.shadowCameraNear = 1000;
			backLight.shadowCameraFar = 4000;

			backLight.shadowCameraLeft = -2000;
			backLight.shadowCameraRight = 2000;
			backLight.shadowCameraTop = 2000;
			backLight.shadowCameraBottom = -2000;

			backLight.shadowCameraVisible = true;

			backLight.shadowCameraFov = 80;
			backLight.shadowBias = 0.0001;
			backLight.shadowDarkness = 0.5;

			backLight.shadowMapWidth = SHADOW_MAP_WIDTH;
			backLight.shadowMapHeight = SHADOW_MAP_HEIGHT;

		// var backLightHelper = new THREE.DirectionalLightHelper(backLight, 100);
		// scene.add(backLightHelper);

		scene.add(backLight);

		// // ambient light
		ambLight = new THREE.AmbientLight(0x050506);
		scene.add(ambLight);



		function toggleHelper() {
			axisHelper.visible = scene_settings.enableHelper;
			grid.visible = scene_settings.enableHelper;

			sunLight.shadowCameraVisible = scene_settings.enableHelper;
			backLight.shadowCameraVisible = scene_settings.enableHelper;
			// backLightHelper.visible = scene_settings.enableHelper;
			
			scene_settings.enableHelper = !scene_settings.enableHelper;
		}
		toggleHelper();



