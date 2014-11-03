
	var container, stats;
	var scene, light, camera, cameraCtrl, renderer;

	// ---- Scene
		container = document.getElementById('canvas-container');
		scene = new THREE.Scene();

	// ---- Camera
		camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 10.0, 100000);
		// -- camera orbit control
		cameraCtrl = new THREE.OrbitControls(camera, container);
		cameraCtrl.object.position.z = 2000;
		cameraCtrl.rotateUp(0.5);
		cameraCtrl.update();

	// ---- Renderer
		renderer = new THREE.WebGLRenderer({antialias: true , alpha: false});
		renderer.setSize(window.innerWidth, window.innerHeight);
		container.appendChild(renderer.domElement);

	// ---- Stats
		stats = new Stats();
		container.appendChild( stats.domElement );

	// ---- grid & axis helper
		var grid = new THREE.GridHelper(600, 50);
		grid.setColors(0x00bbff, 0xffffff);
		grid.material.opacity = 0.1;
		grid.material.transparent = true;
		grid.position.y = -300;
		scene.add(grid);

		var axisHelper = new THREE.AxisHelper(50);
		scene.add(axisHelper);

	// ---- Lights
		// // back light
		// light = new THREE.DirectionalLight(0xffffff, 0.8);
		// light.position.set(100, 230, -100);
		// scene.add(light);

		// // hemi
		// light = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
		// light.position.set(370, 200, 20);
		// scene.add(light);

		// // ambient
		// light = new THREE.AmbientLight(0x111111);
		// scene.add(light);


	// ---- settings
	var scene_settings = {
		bgColor: 0x444444
	};