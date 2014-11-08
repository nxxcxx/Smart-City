
	var container, stats;
	var scene, light, camera, cameraCtrl, renderer;
	var screenWidth = window.innerWidth;
	var screenHeight = window.innerHeight;
	var dpr = 1.0;
	if (window.devicePixelRatio !== undefined) { dpr = window.devicePixelRatio; }

	var mouse = new THREE.Vector2();
	var gui = new dat.GUI();
	var guiCtrl = gui.addFolder('Controls');
	var guiDebug = gui.addFolder('Debug');

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
		scene_settings.maxAnisotropy = renderer.getMaxAnisotropy();

			renderer.shadowMapEnabled = scene_settings.enableShadow;
			renderer.shadowMapType = THREE.PCFSoftShadowMap;



		container.appendChild(renderer.domElement);

	// ---- Stats
		stats = new Stats();
		container.appendChild( stats.domElement );
		// disable graph
		// document.getElementById('fpsGraph').style.display = 'none';

	// ---- grid & axis helper
		// var grid = new THREE.GridHelper(2000, 200);
		// grid.setColors(0x00bbff, 0xffffff);
		// grid.material.opacity = 0.1;
		// grid.material.transparent = true;
		// grid.position.y = -300;
		// scene.add(grid);

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
			scene_settings.enableHelper = !scene_settings.enableHelper;
		}
		toggleHelper();


	// ---- post processing


		var depthTarget = new THREE.WebGLRenderTarget( 512, 512, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat } );
				
		var SSAOpass = new THREE.ShaderPass( THREE.SSAOShader );
		SSAOpass.uniforms[ 'tDepth' ].value = depthTarget;
		SSAOpass.uniforms[ 'size' ].value.set( 512, 512 );
		SSAOpass.uniforms[ 'cameraNear' ].value = camera.near;
		SSAOpass.uniforms[ 'cameraFar' ].value = camera.far;
		SSAOpass.uniforms[ 'onlyAO' ].value = 0;	// debug
		SSAOpass.uniforms[ 'lumInfluence' ].value = 0.5;
		

		// var DOFpass = new THREE.ShaderPass( THREE.BokehShader );	// todo fix broken shader
		// DOFpass.uniforms[ 'tDepth' ].value = depthTarget;
		// DOFpass.uniforms[ 'zNear' ].value = camera.near;
		// DOFpass.uniforms[ 'zFar' ].value = camera.far;
		

		var FXAApass = new THREE.ShaderPass( THREE.FXAAShader );
		FXAApass.uniforms['resolution'].value.set(1 / (window.innerWidth * dpr), 1 / (window.innerHeight * dpr));

		var renderPass = new THREE.RenderPass( scene, camera );

		var CCpass = new THREE.ShaderPass( THREE.ColorCorrectionShader );

		var copyPass = new THREE.ShaderPass( THREE.CopyShader );
		copyPass.renderToScreen = true;

		var composer = new THREE.EffectComposer( renderer );
		composer.setSize(window.innerWidth * dpr, window.innerHeight * dpr);


		var postEffect = {
			SSAO: false,
			FXAA: true,
			CC: true
		};

		var guiPP = guiDebug.addFolder('PostProcessing');
		guiPP.add( postEffect, 'SSAO').onChange(togglePostEffect);
		guiPP.add( postEffect, 'FXAA').onChange(togglePostEffect);
		guiPP.add( postEffect, 'CC').onChange(togglePostEffect);


		var ccu = CCpass.uniforms;

		var ccuEffect = {
			powR: 1.5,
			powG: 1.2,
			powB: 1.0,
			mulR: 1.0,
			mulG: 1.0,
			mulB: 1.0,
		};

		function adjustCC() {
			ccu.mulRGB.value.set(ccuEffect.mulR, ccuEffect.mulG, ccuEffect.mulB);
			ccu.powRGB.value.set(ccuEffect.powR, ccuEffect.powG, ccuEffect.powB);
		}

		var guiCC = guiDebug.addFolder('CC');
		guiCC.add( ccuEffect, 'powR', 1.0, 3.0, 0.01).onChange(adjustCC);
		guiCC.add( ccuEffect, 'powG', 1.0, 3.0, 0.01).onChange(adjustCC);
		guiCC.add( ccuEffect, 'powB', 1.0, 3.0, 0.01).onChange(adjustCC);
		guiCC.add( ccuEffect, 'mulR', 1.0, 3.0, 0.01).onChange(adjustCC);
		guiCC.add( ccuEffect, 'mulG', 1.0, 3.0, 0.01).onChange(adjustCC);
		guiCC.add( ccuEffect, 'mulB', 1.0, 3.0, 0.01).onChange(adjustCC);
		adjustCC();


		function togglePostEffect() {

			composer = new THREE.EffectComposer( renderer );
			composer.setSize(window.innerWidth * dpr, window.innerHeight * dpr);

			composer.addPass( renderPass );

			if (postEffect.SSAO) {
				composer.addPass( SSAOpass );
			}
			if (postEffect.FXAA) {
				composer.addPass( FXAApass );
			}
			if (postEffect.CC) {
				composer.addPass( CCpass );	
			}

			composer.addPass( copyPass );	// only set render to screen for final pass
			
		}
		togglePostEffect();

