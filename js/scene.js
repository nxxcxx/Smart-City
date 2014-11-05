
	var container, stats;
	var scene, light, camera, cameraCtrl, renderer;
	var screenWidth = window.innerWidth;
	var screenHeight = window.innerHeight;
	var dpr = 1.0;
	if (window.devicePixelRatio !== undefined) { dpr = window.devicePixelRatio; }

	var mouse = new THREE.Vector2();
	var gui = new dat.GUI();


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

			renderer.shadowMapEnabled = true;
			renderer.shadowMapType = THREE.PCFSoftShadowMap;


		container.appendChild(renderer.domElement);

	// ---- Stats
		stats = new Stats();
		container.appendChild( stats.domElement );

	// ---- grid & axis helper
		// var grid = new THREE.GridHelper(2000, 200);
		// grid.setColors(0x00bbff, 0xffffff);
		// grid.material.opacity = 0.1;
		// grid.material.transparent = true;
		// grid.position.y = -300;
		// scene.add(grid);

		var axisHelper = new THREE.AxisHelper(1000);
		axisHelper.position.y = 2000;
		scene.add(axisHelper);

	// ---- Lights


		var SHADOW_MAP_WIDTH = 4096, SHADOW_MAP_HEIGHT = 4096;

		// main light
		var DirLight = new THREE.DirectionalLight(0xffe3b1, 1.0);	//0x331100
		DirLight.position.set(-4000, 3000, 3000);

			DirLight.castShadow = true;

			DirLight.shadowCameraNear = 3000;
			DirLight.shadowCameraFar = 7000;

			DirLight.shadowCameraLeft = -1500;
			DirLight.shadowCameraRight = 1500;
			DirLight.shadowCameraTop = 1500;
			DirLight.shadowCameraBottom = -1500;

			// DirLight.shadowCameraVisible = true;

			DirLight.shadowCameraFov = 80;
			DirLight.shadowBias = 0.0001;
			DirLight.shadowDarkness = 0.5;

			DirLight.shadowMapWidth = SHADOW_MAP_WIDTH;
			DirLight.shadowMapHeight = SHADOW_MAP_HEIGHT;

			var dli = {color: '#ffe3b1'};
			gui.addColor(dli, 'color').name('light color').onChange(updateLightCol);
			function updateLightCol(c) {
				DirLight.color.set(c);
			}


		scene.add(DirLight);

		// back light
		light = new THREE.DirectionalLight(0xffffff, 0.5);
		light.position.set(4000, 3000, -4000);

		// light.castShadow = true;
		// light.shadowCameraVisible = true;

		var lightHelper = new THREE.DirectionalLightHelper(light, 100);
		scene.add(lightHelper);
		scene.add(light);

		// // ambient
		light = new THREE.AmbientLight(0x000011);
		scene.add(light);


	// ---- settings

	var maxAnisotropy = renderer.getMaxAnisotropy();
	var scene_settings = {
		bgColor: 0x111113
	};


	// ---- post processing

		var FXAApass = new THREE.ShaderPass( THREE.FXAAShader );
		FXAApass.uniforms['resolution'].value.set(1 / (window.innerWidth * dpr), 1 / (window.innerHeight * dpr));
		FXAApass.renderToScreen = true;

		var SSAOpass = new THREE.ShaderPass( THREE.SSAOShader );
		var depthTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat } );
		SSAOpass.uniforms[ 'tDepth' ].value = depthTarget;
		SSAOpass.uniforms[ 'size' ].value.set( window.innerWidth, window.innerHeight );
		SSAOpass.uniforms[ 'cameraNear' ].value = camera.near;
		SSAOpass.uniforms[ 'cameraFar' ].value = camera.far;
		SSAOpass.renderToScreen = true;

		var copyPass = new THREE.ShaderPass( THREE.CopyShader );
		copyPass.renderToScreen = true;

		var renderPass = new THREE.RenderPass( scene, camera );
		renderPass.renderToScreen = true;

		var composer = new THREE.EffectComposer( renderer );
		composer.setSize(window.innerWidth * dpr, window.innerHeight * dpr);

		
		composer.addPass( renderPass );
		// composer.addPass( copyPass ); // dont need copy pass if pass to shader pass
		// composer.addPass( SSAOpass );
		// composer.addPass( copyPass );
		composer.addPass( FXAApass );
