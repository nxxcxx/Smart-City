
	var container, stats;
	var scene, light, camera, cameraCtrl, renderer;
	var screenWidth = window.innerWidth;
	var screenHeight = window.innerHeight;
	var dpr = 1.0;
	if (window.devicePixelRatio !== undefined) {
	  dpr = window.devicePixelRatio;
	}

	var mouse = new THREE.Vector2();


	// ---- Scene
		container = document.getElementById('canvas-container');
		scene = new THREE.Scene();

	// ---- Camera
		camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1.0, 2000000);
		// -- camera orbit control
		cameraCtrl = new THREE.OrbitControls(camera, container);
		cameraCtrl.object.position.z = 2000;
		cameraCtrl.rotateUp(0.5);
		cameraCtrl.update();

	// ---- Renderer
		renderer = new THREE.WebGLRenderer({antialias: true});
		renderer.setSize(window.innerWidth, window.innerHeight);

				// renderer.shadowMapEnabled = true;
				// renderer.shadowMapType = THREE.PCFSoftShadowMap;


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


			// var SHADOW_MAP_WIDTH = 1024, SHADOW_MAP_HEIGHT = 1024;

		// back light
		light = new THREE.DirectionalLight(0xffffff, 0.8);
		light.position.set(0, 1000, -3000);

			// light.castShadow = true;

			// light.shadowCameraNear = 100;
			// light.shadowCameraFar = 10000;

			// light.shadowCameraLeft = -10000;
			// light.shadowCameraRight = 10000;
			// light.shadowCameraTop = 10000;
			// light.shadowCameraBottom = -10000;

			// light.shadowCameraFov = 80;

			// light.shadowCameraVisible = true;

			// light.shadowBias = 0.0001;
			// light.shadowDarkness = 0.7;

			// light.shadowMapWidth = SHADOW_MAP_WIDTH;
			// light.shadowMapHeight = SHADOW_MAP_HEIGHT;


		scene.add(light);

		// // hemi
		// light = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
		// light.position.set(370, 200, 20);
		// scene.add(light);

		// ambient
		light = new THREE.AmbientLight(0x111111);
		scene.add(light);


	// ---- settings

	var maxAnisotropy = renderer.getMaxAnisotropy();
	var scene_settings = {
		bgColor: 0x111113
	};


	// ---- post processing

		var effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
		effectFXAA.uniforms['resolution'].value.set(1 / (window.innerWidth * dpr), 1 / (window.innerHeight * dpr));
		effectFXAA.renderToScreen = true;

		var effectSSAO = new THREE.ShaderPass( THREE.SSAOShader );
		var depthTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat } );
		effectSSAO.uniforms[ 'tDepth' ].value = depthTarget;
		effectSSAO.uniforms[ 'size' ].value.set( window.innerWidth, window.innerHeight );
		effectSSAO.uniforms[ 'cameraNear' ].value = camera.near;
		effectSSAO.uniforms[ 'cameraFar' ].value = camera.far;
		effectSSAO.renderToScreen = true;

		var composer = new THREE.EffectComposer( renderer );
		composer.setSize(window.innerWidth * dpr, window.innerHeight * dpr);
		composer.addPass( new THREE.RenderPass( scene, camera ) );

		
		// composer.addPass( effectSSAO );
		// composer.addPass( effectFXAA );
