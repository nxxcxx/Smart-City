
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

		composer.addPass(renderPass);
		composer.addPass(SSAOpass);
		composer.addPass(FXAApass);
		composer.addPass(CCpass);
		composer.addPass(copyPass);

		SSAOpass.enabled = false;

		var guiPP = guiDebug.addFolder('Post-Processing');
		guiPP.add( SSAOpass, 'enabled').name('SSAO');
		guiPP.add( FXAApass, 'enabled').name('FXAA');
		guiPP.add( CCpass, 'enabled').name('Color Correction');


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

		var guiCC = guiPP.addFolder('Color Correction');
		guiCC.add( ccuEffect, 'powR', 1.0, 3.0, 0.01).onChange(adjustCC);
		guiCC.add( ccuEffect, 'powG', 1.0, 3.0, 0.01).onChange(adjustCC);
		guiCC.add( ccuEffect, 'powB', 1.0, 3.0, 0.01).onChange(adjustCC);
		guiCC.add( ccuEffect, 'mulR', 1.0, 3.0, 0.01).onChange(adjustCC);
		guiCC.add( ccuEffect, 'mulG', 1.0, 3.0, 0.01).onChange(adjustCC);
		guiCC.add( ccuEffect, 'mulB', 1.0, 3.0, 0.01).onChange(adjustCC);
		adjustCC();






	var assetManager = (function assetManager() {

		var texPath = 'assets/';
		var texFormat = '.png';

		var modelPath = 'assets/';
		var modelFormat = '.obj';

		var assets = {
			textures: {},
			models: {},
			materials: {}
		};

		function addFile(key, filename) {

			var ast;
			if (filename.indexOf(texFormat) !== -1) {	// if png file
				ast = assets.textures[key] = {};
				ast.texUrl = texPath + filename;
				ast.texture = null;
			}
			if (filename.indexOf(modelFormat) !== -1) {	// if obj file
				ast = assets.models[key] = {};
				ast.modelUrl = modelPath + filename;
				ast.model = null;
			}
			
			return this;
		}

		function get() { return assets; }

		function getModel(key) { return assets.models[key].model; }

		function getTexture(key) {return assets.textures[key].texture; }

		function getMaterial(key) {return assets.materials[key]; }

		function addTexture(key, texture) {
			assets.textures[key] = {};
			assets.textures[key].texture = texture;
			return this;
		}

		function addMaterial(key, material) {
			assets.materials[key] = material;
			return this;
		}

		return {
			addFile: addFile,
			get: get,
			getModel: getModel,
			getTexture: getTexture,
			getMaterial: getMaterial,
			addMaterial: addMaterial,
			addTexture: addTexture
		};

	})();


	assetManager

		// empty hexagon platform 
		.addFile('emptyPlatformTex', '1024emptyPlatform.png')
		.addFile('emptyPlatform', 'emptyPlatform.obj')

		// hexagon platform  shell
		.addFile('shellTex', '1024platformShell.png')
		.addFile('shell', 'platformShell.obj')

		// shore
		.addFile('shorePlatformTex', 'shore/1024shorePlatform.png')
		.addFile('shorePlatform', 'shore/shorePlatform.obj')

		.addFile('shoreWaterSurfaceTex', 'shore/1024shoreWaterSurface.png')
		.addFile('shoreWaterSurface', 'shore/shoreWaterSurface.obj')

		// wind turbine
		.addFile('turbineBaseTex', 'turbine/1024turbineBase.png')
		.addFile('turbineBase', 'turbine/turbineBase.obj')

		.addFile('propellerTex', 'turbine/1024propeller.png')
		.addFile('propeller', 'turbine/propeller.obj')

		// hub
		.addFile('hubPlatformTex', 'hub/1024hubplatform.png')
		.addFile('hubPlatform', 'hub/hubplatform.obj')

		.addFile('hubWindowTex', 'hub/1024hubwindow.png')
		.addFile('hubWindow', 'hub/hubwindow.obj')

		.addFile('hubStreetLine', 'hub/hubstreetline.obj')

		// city 01
		.addFile('city01Tex', 'city01/1024city01.png')
		.addFile('city01', 'city01/city01.obj')

		// tollway
		.addFile('tollwayTex', 'tollway/1024tollway.png')
		.addFile('tollway', 'tollway/tollway.obj')

		.addFile('tollwayLine', 'tollway/tollwayline.obj')

		// city 02 
		.addFile('city02Tex', 'city02/1024city02.png')
		.addFile('city02', 'city02/city02.obj')

		// city 03 
		.addFile('city03Tex', 'city03/1024city03.png')
		.addFile('city03', 'city03/city03.obj')

		// resident 01
		.addFile('resident01Tex', 'resident01/1024resident01.png')
		.addFile('resident01', 'resident01/resident01.obj')

		// resident 02
		.addFile('resident02Tex', 'resident02/1024resident02.png')
		.addFile('resident02', 'resident02/resident02.obj')

		// landfill
		.addFile('landfillTex', 'landfill/1024landfill.png')
		.addFile('landfill', 'landfill/landfill.obj')

		// water supply
		.addFile('watersupplyTex', 'watersupply/1024watersupply.png')
		.addFile('watersupply', 'watersupply/watersupply.obj')



	;


// initialize loading manager

	var loadingBar = document.getElementById('loading');

	var loadingManager = new THREE.LoadingManager();
		console.time('loadingManager');
		loadingManager.onProgress = function ( item, loaded, total ) {
			// console.log( item, loaded, total );
			var percentageCompleted = loaded/total * 100;
			loadingBar.style.width = percentageCompleted + '%';
		};
		loadingManager.onError = function () {
			console.error('Error: loading assets');
		};
		loadingManager.onLoad = function () {
			console.log('finished loading');
			console.timeEnd('loadingManager');
			loadingBar.style.display = 'none';
			startScene();
			render();
		};

	var textureLoader = new THREE.ImageLoader(loadingManager);
	var OBJloader = new THREE.OBJLoader(loadingManager);


// iterate through each asset, then load and store it
	_.each(assetManager.get().textures, function(asset) {
		textureLoader.load( asset.texUrl, function (image) {
			asset.texture = new THREE.Texture(image);
			asset.texture.needsUpdate = true;
		});
	});

	_.each(assetManager.get().models, function(asset) {
		OBJloader.load( asset.modelUrl, function (object) {
			asset.model = object.children[0]; // select mesh
			asset.model.geometry.computeVertexNormals();  // very important ************************************ or NO MATERIAL!
			


			// move later
			asset.model.receiveShadow = true;
			asset.model.castShadow = true;



		});
	});


	// Skybox texture
	var path = "assets/skybox/";
	var format = '.bmp';
	var urls = [
		path + 'px' + format, path + 'nx' + format,
		path + 'py' + format, path + 'ny' + format,
		path + 'pz' + format, path + 'nz' + format
	];

	var reflectionCube = loadTextureCube(urls);
	assetManager.addTexture('reflectionCube', reflectionCube);


	function loadTextureCube(arrayURL, mapping, onLoad) {

		var images = [];

		var loader = new THREE.ImageLoader(loadingManager);
		loader.crossOrigin = this.crossOrigin;

		var texture = new THREE.CubeTexture( images, mapping );
		texture.format = THREE.RGBFormat;
		texture.flipY = false;

		var loaded = 0;
		var loadTexture = function (i) {
			loader.load( arrayURL[ i ], function ( image ) {
				texture.images[ i ] = image;
				loaded += 1;
				if ( loaded === 6 ) {
					texture.needsUpdate = true;
					if ( onLoad ) onLoad( texture );
				}
			});
		};

		for (var i = 0, il = arrayURL.length; i < il; i++) {
			loadTexture(i);
		}

		return texture;

	}


	var world = {};

	THREE.Object3D.prototype.setDefaultPos = function(x, y, z, rx, ry, rz) {
		this.position.set(x, y, z);
		this.oripos = this.position.clone();
		this.orirot = this.rotation.clone();
		if (rx && ry && rz) {
			this.rotation.set(rx, ry, rz);
			this.orirot = this.rotation.clone();
		}
	};


	function startScene() {

		
		// Experimental stuff
			// // test shader 

				// var seaShaderUniforms = {
				// 	time: { type: "f", value: 1.0 },
				// 	resolution: { type: "v2", value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
				// };

				// var seaShaderMat = new THREE.ShaderMaterial( {

				// 	uniforms: seaShaderUniforms,
				// 	vertexShader: document.getElementById( 'vertexShader' ).textContent,
				// 	fragmentShader: document.getElementById( 'fragmentShader' ).textContent,

				// } );

				// var shaderMesh = new THREE.Mesh( new THREE.BoxGeometry(2000, 10, 2000), seaShaderMat );
				// shaderMesh.position.y = 2000;
				// scene.add( shaderMesh );



		// private stuff
		(function init() {

			// create base shell for cloning
			var shell = constructModel('shell', {map: 'shellTex'});
			shell.castShadow = false;
			shell.receiveShadow = false;

		})();

		// ------- Model helper

		function constructModel(modelKey, settings) {

			var model = assetManager.getModel(modelKey);

			var material = new THREE.MeshLambertMaterial({
				shading: THREE.FlatShading
			});

			_.each(settings, function(value, key, list) {

				if (key === 'map' || key === 'envMap') {
					value = assetManager.getTexture(value);
				} else if (key === 'color' || key === 'emissive') {
					value = new THREE.Color(value);
				}
				material[key] = value;

			});

			assetManager.addMaterial(modelKey, material);	// use modelName as materialName
			model.material = material;

			return model;
		}

		function getNewShell() {

			return assetManager.getModel('shell').clone();
		}
		


		// world stuff

		world.sky = initSky(); // do magic by zz85

		world.shore1 = (function () {

			var shore = new THREE.Object3D();
			var shorePlatform = constructModel('shorePlatform', {color: 0xddddee});
			var shoreWaterSurface = constructModel('shoreWaterSurface', {map:'shoreWaterSurfaceTex' , envMap: 'reflectionCube', opacity: 0.9, transparent: true});
			shorePlatform.castShadow = false;

			// overridw w/ shader
			// shoreWaterSurface.material = seaShaderMat;

			shore.add(shorePlatform, shoreWaterSurface);
			shore.setDefaultPos(-1400, 0, 805);

			return shore;

		})();

		world.shore2 = (function () {

			var shore = world.shore1.clone();
			shore.setDefaultPos(-700, 0, 1215);
			return shore;

		})();

		world.shore3 = (function () {

			var shore = world.shore1.clone();
			shore.setDefaultPos(0, 0, 1623);
			return shore;

		})();
		
		world.turbines = (function () {

			var allTurbines = new THREE.Object3D();
			var windTurbine = new THREE.Object3D();
			var turBase = constructModel('turbineBase', {color: 0xddddee});
			var turPro = constructModel('propeller', {color: 0xddddee});


			turPro.position.set(0, 268, -10);

			windTurbine.add(turBase);
			windTurbine.add(turPro);
			
			var windTurbine2 = windTurbine.clone();
			var windTurbine3 = windTurbine.clone();

			windTurbine.position.set(-1629, 90, 740);
			windTurbine2.position.set(-1454, 90, 842);
			windTurbine3.position.set(-1286, 90, 940);

			windTurbine.rotation.y = 
			windTurbine2.rotation.y = 
			windTurbine3.rotation.y = THREE.Math.degToRad(110);

			allTurbines.add(windTurbine, windTurbine2, windTurbine3);

			allTurbines.spin = function () {
				windTurbine.children[1].rotation.z += 0.05;
				windTurbine2.children[1].rotation.z += 0.05;
				windTurbine3.children[1].rotation.z += 0.05;
			};

			return allTurbines;

		})();
			
		world.hub = (function () {

			var hub = new THREE.Object3D();
			var hubWindow = constructModel('hubWindow', {map: 'hubWindowTex', envMap: 'reflectionCube', reflectivity: 0.9});
			var hubPlatform = constructModel('hubPlatform', {color: 0xddddee});
			var hubStreetLine = constructModel('hubStreetLine', {emissive: 0x0066ff});
			hubStreetLine.castShadow = false;
			hubStreetLine.receiveShadow = false;
			var hubShell = getNewShell();
			hub.add(hubShell, hubPlatform, hubWindow, hubStreetLine);
			hub.setDefaultPos(0, 0, 0);
			return hub;

		})();

		world.city01 = (function () {

			var city01 = new THREE.Object3D();
			var city01Buildings = constructModel('city01', {color: 0xddddee});
			var city01Shell = getNewShell();
			city01.setDefaultPos(0, 0, -808);
			city01.add(city01Buildings, city01Shell);
			return city01;

		})();

		world.city02 = (function () {

			var city02 = new THREE.Object3D();
			var city02Buildings = constructModel('city02', {color: 0xddddee});
			var city02Shell = getNewShell();
			city02.setDefaultPos(700, 0, -405);
			city02.add(city02Buildings, city02Shell);
			return city02;

		})();

		world.city03 = (function () {

			var city03 = new THREE.Object3D();
			var city03Buildings = constructModel('city03', {color: 0xddddee});
			var city03Shell = getNewShell();
			city03.setDefaultPos(0, 0, 810);
			city03.add(city03Buildings, city03Shell);
			return city03;

		})();
		
		world.tollway = (function () {

			var tollway = new THREE.Object3D();
			var tollwayStreet = constructModel('tollway', {color: 0xddddee});
			var tollwayLine = constructModel('tollwayLine', {emissive: 0x0066ff});
			tollwayLine.castShadow = false;
			tollwayLine.receiveShadow = false;
			var tollwayShell = getNewShell();
			tollway.setDefaultPos(-702, 0, -403);
			tollway.add(tollwayStreet, tollwayLine, tollwayShell);
			return tollway;

		})();
			
		world.landfill = (function () {

			var landfill = new THREE.Object3D();
			var lf = constructModel('landfill', {color: 0xddddee});
			var lfshell = getNewShell();
			landfill.add(lf, lfshell);
			landfill.setDefaultPos(1400, 0, -805);
			return landfill;

		})();

		world.watersupply = (function () {

			var watersupply = new THREE.Object3D();
			var ws = constructModel('watersupply', {color: 0xddddee});
			var wsshell = getNewShell();
			watersupply.add(ws, wsshell);
			watersupply.setDefaultPos(700, 0, 405);
			return watersupply;

		})();

		world.resident1 = (function () {

			var resident01 = new THREE.Object3D();
			var resident01Buildings = constructModel('resident01', {color: 0xddddee});
			var resident01Shell = getNewShell();
			resident01.setDefaultPos(-700, 0, -1213);
			resident01.rotation.y = THREE.Math.degToRad(120);
			resident01.add(resident01Buildings, resident01Shell);
			return resident01;

		})();

		world.resident2 = (function () {

			var resident02 = new THREE.Object3D();
			var resident02Buildings = constructModel('resident02', {color: 0xddddee});
			var resident02Shell = getNewShell();
			resident02.setDefaultPos(-1400, 0, -809);
			resident02.add(resident02Buildings, resident02Shell);
			return resident02;

		})();

		world.resident3 = (function () {

			var resident03 = world.resident2.clone();
			resident03.setDefaultPos(-1400, 0, -0);
			resident03.rotation.y = THREE.Math.degToRad(120);
			return resident03;

		})();

		world.resident4 = (function () {

			var resident04 = world.resident1.clone();
			resident04.setDefaultPos(-700, 0, 406);
			resident04.rotation.y = THREE.Math.degToRad(0);
			return resident04;

		})();
		
		world.eplatform1 = (function () {

			var ep01 = new THREE.Object3D();
			var ep = constructModel('emptyPlatform', {color: 0xddddee});
			var epshell = getNewShell();
			ep01.add(ep, epshell);
			ep01.setDefaultPos(0, 0, -1618);
			return ep01;

		})();

		world.eplatform2 = (function () {

			var ep02 = world.eplatform1.clone();
			ep02.setDefaultPos(700, 0, -1211);
			return ep02;

		})();

		world.eplatform3 = (function () {

			var ep03 = world.eplatform1.clone();
			ep03.setDefaultPos(1398, 0, 0);
			return ep03;

		})();

		world.eplatform4 = (function () {

			var ep04 = world.eplatform1.clone();
			ep04.setDefaultPos(1398, 0, 807);
			return ep04;

		})();
		

		world.eplatform5 = (function () {

			var ep05 = world.eplatform1.clone();
			ep05.setDefaultPos(700, 0, 1210);
			return ep05;

		})();

		// --- add all to scene
		_.each(world, function (object) {
			scene.add(object);
		});

		// set default view
		animateCityView();

	}	// end startScene fn


	// draw loop
	function render(time) {
		requestAnimationFrame(render);
		TWEEN.update(time);
		animate(time);
		renderer.setClearColor(scene_settings.bgColor, 1);
		
		// intersectMouse(assetManager.getModel('hubBuilding'));

		// renderer.render(scene, camera);
		composer.render();

		stats.update();
	}



	// ------ prototype function


		// --- test ray caster 3D object-mouse intersection todo: check platform's children if contain intersected mesh then do sth

			// var raycaster = new THREE.Raycaster();
			// function intersectMouse(mesh) {
				
			// 	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 ).unproject( camera );

			// 	raycaster.set( camera.position, vector.sub( camera.position ).normalize() );

			// 	var intersects = raycaster.intersectObject( mesh );

			// 	if ( intersects.length > 0 ) {
			// 		var intersect = intersects[0];
			// 		console.warn(intersects);
			// 		if (intersect.object == mesh) {  // r69 now return face3
			// 			console.warn(111);
			// 		}

			// 	}
			// }
		






	/*jshint unused: false */

	var currView = 'city';

	function animate(time) {

		// seaShaderUniforms.time.value = time*0.0005;
		world.turbines.spin();

		// if (currView === 'waterNetwork') {
		// 	world.watersupply.rotation.y += 0.01;
		// 	if (world.watersupply.rotation.y > Math.PI*2.0) {
		// 		world.watersupply.rotation.y = 0;
		// 	}
		// }


		if (guiSky && guiCC) {
			for (var i in guiSky.__controllers) {
				guiSky.__controllers[i].updateDisplay();
			}
			for (var i in guiCC.__controllers) {
				guiCC.__controllers[i].updateDisplay();
			}
		}
		
		
	}

	// --------- Extend animation methods to Object3D

		THREE.Object3D.prototype.animateResetPos = function () {
			// reset position
			new TWEEN.Tween( this.position ).to( {
				x: this.oripos.x,
				y: this.oripos.y,
				z: this.oripos.z }, 
				1000 )
			.easing( TWEEN.Easing.Quadratic.Out)
			.start();
			// reset rotation
			new TWEEN.Tween( this.rotation ).to( {
				x: this.orirot.x,
				y: this.orirot.y,
				z: this.orirot.z }, 
				1000 )
			.easing( TWEEN.Easing.Quadratic.Out)
			.start();
		};


		THREE.Object3D.prototype.animatePos = function (x, y, z) {
			new TWEEN.Tween( this.position ).to( {
				x: x,
				y: y,
				z: z }, 
				1000 )
			.easing( TWEEN.Easing.Quadratic.Out)
			.start();
		};

		THREE.Object3D.prototype.animateY = function (y) {
			new TWEEN.Tween( this.position ).to( {
				y: y}, 
				1000 )
			.easing( TWEEN.Easing.Quadratic.Out)
			.start();
		};

	// -------- Main animation

		function animateCameraTo(target, position, speed) {

			new TWEEN.Tween( cameraCtrl.target )
				.to( {	x: target.x,
						y: target.y,
						z: target.z
					 }, speed || 1000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() {cameraCtrl.update();})
			.start();

			new TWEEN.Tween( cameraCtrl.object.position )
				.to( {	x: position.x,
						y: position.y,
						z: position.z
					 }, speed || 1000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() {cameraCtrl.update();})
			.start();

		}

		function animateFOV(fov) {
			new TWEEN.Tween( camera )
				.to( {	fov: fov
					 }, 1000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() { camera.updateProjectionMatrix(); })
			.start();
		}

		function setFov(fov) {
			camera.fov = fov;
			camera.updateProjectionMatrix();
		}

		function animateSky(a, b, c, d, e, f, g) {
			var sky = world.sky;
			new TWEEN.Tween( sky.ctrl )
				.to( {	turbidity: a,
						reileigh: b,
						mieCoefficient: c,
						mieDirectionalG: d,
						liminance: e,
						inclination: f,
						azimuth: g
					 }, 3000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() {sky.updateCtrl();})
			.start();
		}

		function animateDirLightColor(r, g, b) {
			new TWEEN.Tween( DirLight.color )
				.to( {	r: r, 
						g: g,
						b: b
					 }, 3000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() {})
			.start();
		}



	// --------- City Views Animation

		function resetView() {
			if (currView === 'waterNetwork') {
				world.watersupply.animateResetPos();
			}
		}

		function animateCityView() {

			animateCameraTo(new THREE.Vector3(-350.15 , -278.71 , -5.32), 
							new THREE.Vector3(-1830.50 , 2112.81 , -25.24));

			animateFOV(80);
			animateSky(4.8, 4, 0.06, 0.76, 0.35, 0.86, 0.9); // clear sky
			animateDirLightColor(1, 1, 1);

			resetView();

			currView = 'city';

		}

		function animateTollwayView() {

			animateCameraTo(new THREE.Vector3(215.35 , 70.55 , 1377.40), 
							new THREE.Vector3(-570.12 , 216.03 , -188.98));

			animateFOV(100);
			animateSky(20, 4, 0.1, 0.93, 0.11, 0.5, 0.65);	//sunset sky: 20, 4, 0.1, 0.93, 0.11, 0.5, 0.67
			animateDirLightColor(0, 0, 0);

			resetView();

			currView = 'tollway';

		}

		function animateLowAngleView() {

			animateCameraTo(new THREE.Vector3(-31.30, 581.13, 372.64), 
							new THREE.Vector3(-462.15, 171.85, -245.54));

			animateFOV(120);
			animateSky(4.8, 4, 0.06, 0.76, 0.35, 0.86, 0.9);
			animateDirLightColor(1, 1, 1);

			resetView();

			currView = 'lowAngle';

		}

		function animateTurbinesView() {

			animateCameraTo(new THREE.Vector3(-1005.12 , 91.27 , 865.27), 
							new THREE.Vector3(-1859.96 , 453.77 , 1066.81));

			animateFOV(90);
			animateSky(4.8, 4, 0.06, 0.76, 0.35, 0.86, 0.9);
			animateDirLightColor(1, 1, 1);

			resetView();

			currView = 'turbines';

		}

		function animateLandfillView() {

			animateCameraTo(new THREE.Vector3(1141.98 , -180.74 , 416.46), 
							new THREE.Vector3(1294.15 , 509.40 , -1416.20));

			animateFOV(80);
			animateSky(4.8, 4, 0.06, 0.76, 0.35, 0.86, 0.9);
			animateDirLightColor(1, 1, 1);

			resetView();

			currView = 'landfill';

		}

		function animateWaterNetworkView() {

			if (currView === 'waterNetwork') return;

			animateCameraTo(new THREE.Vector3(854.92 , 415.85 , 514.55), 
							new THREE.Vector3(-60.48 , 697.84 , 524.37));

			animateFOV(80);
			animateSky(4.8, 4, 0.06, 0.76, 0.35, 0.86, 0.9);
			animateDirLightColor(1, 1, 1);

			world.watersupply.animateY(700);

			resetView();

			currView = 'waterNetwork';

		}

		function animateLowPerspectiveView() {

			animateCameraTo(new THREE.Vector3(-23.30 , 721.89 , -9.59), 
							new THREE.Vector3(-15511.88 , 912.70 , 4339.07));

			setFov(5);
			animateSky(4.8, 4, 0.06, 0.76, 0.35, 0.86, 0.9);
			animateDirLightColor(1, 1, 1);

			resetView();

			currView = 'lowPerspective';

		}


	// view ctrl GUI

		
		var viewCtrl = {
			lowPerspective: animateLowPerspectiveView,
			city: animateCityView,
			turbines: animateTurbinesView,
			landfill: animateLandfillView,
			waterNetwork: animateWaterNetworkView,
			tollway: animateTollwayView,
			lowAngle: animateLowAngleView
		};

		guiViews.add(viewCtrl, 'lowPerspective');
		guiViews.add(viewCtrl, 'city');
		guiViews.add(viewCtrl, 'turbines');
		guiViews.add(viewCtrl, 'landfill');
		guiViews.add(viewCtrl, 'waterNetwork');
		guiViews.add(viewCtrl, 'tollway');
		guiViews.add(viewCtrl, 'lowAngle');


	window.addEventListener('keypress', function (event) {
		if (event.keyCode === 32) {	// if spacebar is pressed
			event.preventDefault();
			gui.closed =! gui.closed; // toggle gui

		}
		if (event.keyCode === 99) {	// if 'C' is pressed
			event.preventDefault();
			console.log('CTGT:', cameraCtrl.target.x.toFixed(2), ',', cameraCtrl.target.y.toFixed(2), ',', cameraCtrl.target.z.toFixed(2));
			console.log('CPOS:', cameraCtrl.object.position.x.toFixed(2), ',', cameraCtrl.object.position.y.toFixed(2), ',', cameraCtrl.object.position.z.toFixed(2));
			console.log('FOV:', camera.fov);
		}
	});

	// fullscreen
	document.body.addEventListener('keypress', function(event) {
		if (event.keyCode === 102) {	// if 'F' is pressed
			event.preventDefault();
			THREEx.FullScreen.request();
		}
	}, false);

	window.addEventListener('resize', onWindowResize, false);
	function onWindowResize() {
		screenWidth = window.innerWidth;
		screenHeight = window.innerHeight;
		camera.aspect = screenWidth / screenHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(screenWidth, screenHeight);

		FXAApass.uniforms['resolution'].value.set(1 / (window.innerWidth * dpr), 1 / (window.innerHeight * dpr));
  		composer.setSize(window.innerWidth * dpr, window.innerHeight * dpr);

	}

	// document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	// function onDocumentMouseMove( event ) {
	// 	event.preventDefault();
	// 	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	// 	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	// }

	// document.addEventListener( 'click', onClick, false);
	// function onClick( event ) {
	// 	event.preventDefault();
	// } 

var guiSky;

// sky by zz85
function initSky() {

	// Add Sky Mesh
	sky = new THREE.Sky();

	// Add Sun Helper
	sunSphere = new THREE.Mesh( new THREE.SphereGeometry( 20000, 30, 30 ),
		new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: false }));
	sunSphere.position.y = -700000;
	scene.add( sunSphere );

	/// GUI
	sky.mesh.ctrl  = {
		turbidity: 4.8,
		reileigh: 4,
		mieCoefficient: 0.06,
		mieDirectionalG: 0.76,
		luminance: 0.35,
		inclination: 0.83,
		azimuth: 0.9,				
		sun: !true
	};

	var distance = 400000;

	sky.mesh.changeSetting = function (a,b,c,d,e,f,g) {
		sky.mesh.ctrl.turbidity	= a;
		sky.mesh.ctrl.reileigh	= b;
		sky.mesh.ctrl.mieCoefficient	= c;
		sky.mesh.ctrl.mieDirectionalG	= d;
		sky.mesh.ctrl.luminance	= e;
		sky.mesh.ctrl.inclination	= f;
		sky.mesh.ctrl.azimuth	= g;
	};

	sky.mesh.updateCtrl = function () {
		var uniforms = sky.uniforms;
		uniforms.turbidity.value = sky.mesh.ctrl.turbidity;
		uniforms.reileigh.value = sky.mesh.ctrl.reileigh;
		uniforms.luminance.value = sky.mesh.ctrl.luminance;
		uniforms.mieCoefficient.value = sky.mesh.ctrl.mieCoefficient;
		uniforms.mieDirectionalG.value = sky.mesh.ctrl.mieDirectionalG;
		var theta = Math.PI * (sky.mesh.ctrl.inclination - 0.5);
		var phi = 2 * Math.PI * (sky.mesh.ctrl.azimuth - 0.5);
		sunSphere.position.x = distance * Math.cos(phi);
		sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta); 
		sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta); 
		sunSphere.visible = sky.mesh.ctrl.sun;
		sky.uniforms.sunPosition.value.copy(sunSphere.position);


		var lightDist = 6000;
		theta += 0.2;
		DirLight.position.x = lightDist * Math.cos(phi);
		DirLight.position.y = lightDist * Math.sin(phi) * Math.sin(theta); 
		DirLight.position.z = lightDist * Math.sin(phi) * Math.cos(theta); 

	};

	guiSky = guiDebug.addFolder('Sky');
	guiSky.add( sky.mesh.ctrl, "turbidity", 1.0, 20.0, 0.1 ).onChange( sky.mesh.updateCtrl );
	guiSky.add( sky.mesh.ctrl, "reileigh", 0.0, 4, 0.001 ).onChange( sky.mesh.updateCtrl );
	guiSky.add( sky.mesh.ctrl, "mieCoefficient", 0.0, 0.1, 0.001 ).onChange( sky.mesh.updateCtrl );
	guiSky.add( sky.mesh.ctrl, "mieDirectionalG", 0.0, 1, 0.001 ).onChange( sky.mesh.updateCtrl );
	guiSky.add( sky.mesh.ctrl, "luminance", 0.0, 2).onChange( sky.mesh.updateCtrl );
	guiSky.add( sky.mesh.ctrl, "inclination", 0, 1, 0.0001).onChange( sky.mesh.updateCtrl );
	guiSky.add( sky.mesh.ctrl, "azimuth", 0, 1, 0.0001).onChange( sky.mesh.updateCtrl );
	guiSky.add( sky.mesh.ctrl, "sun").onChange( sky.mesh.updateCtrl );
	sky.mesh.updateCtrl();


	return sky.mesh;

}