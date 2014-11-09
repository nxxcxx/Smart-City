
	var container, stats;
	var scene, light, camera, cameraCtrl, renderer;
	var screenWidth = window.innerWidth;
	var screenHeight = window.innerHeight;
	var dpr = 1.0;
	if (window.devicePixelRatio !== undefined) { dpr = window.devicePixelRatio; }

	var mouse = new THREE.Vector2();
	var gui = new dat.GUI();
	var guiCtrl = gui.addFolder('Controls');
	var guiViews = guiCtrl.addFolder('Views');
	var guiDebug = gui.addFolder('Debug');
	gui.open();
	guiCtrl.open();
	guiViews.open();

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
		renderer = new THREE.WebGLRenderer({antialias: true});
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
		var DirLight = new THREE.DirectionalLight(0xffffff, 1.2);	//0x331100
		DirLight.position.set(-4000, 3000, 3000);

			DirLight.castShadow = true;

			DirLight.shadowCameraNear = 4000;
			DirLight.shadowCameraFar = 8000;

			DirLight.shadowCameraLeft = -2000;
			DirLight.shadowCameraRight = 2000;
			DirLight.shadowCameraTop = 2000;
			DirLight.shadowCameraBottom = -2000;

			DirLight.shadowCameraVisible = true;

			DirLight.shadowCameraFov = 80;
			DirLight.shadowBias = 0.0001;
			DirLight.shadowDarkness = 0.5;

			DirLight.shadowMapWidth = SHADOW_MAP_WIDTH;
			DirLight.shadowMapHeight = SHADOW_MAP_HEIGHT;

			var dli = {color: '#ffffff'};
			guiDebug.addColor(dli, 'color').name('dirL').onChange(updateLightCol);
			function updateLightCol(c) {
				DirLight.color.set(c);
			}


		scene.add(DirLight);

		// front light
		// var frontLight = new THREE.DirectionalLight(0xffffff, 1.0);	//0x331100
		// frontLight.position.set(-4000, 3000, 3000);
		// scene.add(frontLight);

		// // back light
		backLight = new THREE.DirectionalLight(0xffffff, 0.5);
		backLight.position.set(4000, 3000, -4000);

		var backLightHelper = new THREE.DirectionalLightHelper(backLight, 100);
		scene.add(backLightHelper);
		scene.add(backLight);

		// // ambient
		light = new THREE.AmbientLight(0x050506);
		scene.add(light);



		function toggleHelper() {
			axisHelper.visible = scene_settings.enableHelper;
			DirLight.shadowCameraVisible = scene_settings.enableHelper;
			backLightHelper.visible = scene_settings.enableHelper;
			grid.visible = scene_settings.enableHelper;
			scene_settings.enableHelper = !scene_settings.enableHelper;
		}
		toggleHelper();



