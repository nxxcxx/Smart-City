
	var container, stats;
	var scene, light, camera, cameraCtrl, renderer;
	var world = {};
	var screenWidth = window.innerWidth;
	var screenHeight = window.innerHeight;
	var dpr = 1.0;
	if (window.devicePixelRatio !== undefined) { dpr = window.devicePixelRatio; }

	var mouse = new THREE.Vector2(-1, -1);

	// ---- GUI initial setup
	var gui = new dat.GUI();
	var guiCtrl = gui.addFolder('Controls');
	var guiViews = guiCtrl.addFolder('Views');
	var guiDebug = gui.addFolder('Debug');
	gui.open();
	guiCtrl.open();
	guiViews.open(); 
	guiDebug.open();

	// ---- settings
	var scene_settings = {
		enableHelper: true,
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

			sunLight.shadowCameraNear = 1000;
			sunLight.shadowCameraFar = 5000;

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
			guiDebug.add(sunLight, 'intensity', 0.0, 2.0, 0.1);
			guiDebug.addColor(sunLightColor, 'color').name('sunLight').onChange(updateLightCol);
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





// ---- Post-Processing

	var depthTarget = new THREE.WebGLRenderTarget( 512, 512, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat } );
			
	var SSAOpass = new THREE.ShaderPass( THREE.SSAOShader );
	SSAOpass.uniforms[ 'tDepth' ].value = depthTarget;
	SSAOpass.uniforms[ 'size' ].value.set( 512, 512 );
	SSAOpass.uniforms[ 'cameraNear' ].value = camera.near;
	SSAOpass.uniforms[ 'cameraFar' ].value = camera.far;
	SSAOpass.uniforms[ 'onlyAO' ].value = 0;	// debug
	SSAOpass.uniforms[ 'lumInfluence' ].value = 0.5;


	var FXAApass = new THREE.ShaderPass( THREE.FXAAShader );
	FXAApass.uniforms['resolution'].value.set(1 / (screenWidth * dpr), 1 / (screenHeight * dpr));

	var renderPass = new THREE.RenderPass( scene, camera );

	var CCpass = new THREE.ShaderPass( THREE.ColorCorrectionShader );

	var copyPass = new THREE.ShaderPass( THREE.CopyShader );
	copyPass.renderToScreen = true;


	var cvPass = new THREE.ShaderPass( THREE.ConvolutionShader );
	cvPass.uniforms['cKernel'].value = [1/16, 2/16, 1/16, 2/16, 4/16, 2/16, 1/16, 2/16, 1/16];


	var CCNIXpass = new THREE.ShaderPass( THREE.ColorCorrectionShaderNIX );


	var composer = new THREE.EffectComposer( renderer );
	composer.setSize(screenWidth * dpr, screenHeight * dpr);

	composer.addPass(renderPass);

	composer.addPass(SSAOpass);

	composer.addPass(FXAApass);
	
	composer.addPass(CCpass);

	// composer.addPass(cvPass);

	composer.addPass(CCNIXpass);

	composer.addPass(copyPass);

	SSAOpass.enabled = false;

	var guiPP = guiDebug.addFolder('Post-Processing');
	guiPP.open();

	guiPP.add( SSAOpass, 'enabled').name('SSAO');
	guiPP.add( FXAApass, 'enabled').name('FXAA');
	
	guiBleach = guiPP.addFolder('Bleach Bypass & E6C41');
	guiBleach.add( CCNIXpass, 'enabled').name('Enable');
	guiBleach.add( CCNIXpass.uniforms.uOpacity, 'value', 0.0, 2.0, 0.1).name('Bleach Bypass');
	guiBleach.add( CCNIXpass.uniforms.uOpacity2, 'value', 0.0, 2.0, 0.1).name('E6C41');

	
	var ccu = CCpass.uniforms;

	var ccuEffect = {
		powR: 1.15,
		powG: 1.15,
		powB: 1.1,
		mulR: 1.0,
		mulG: 1.0,
		mulB: 1.0,
	};

	function adjustCC() {
		ccu.mulRGB.value.set(ccuEffect.mulR, ccuEffect.mulG, ccuEffect.mulB);
		ccu.powRGB.value.set(ccuEffect.powR, ccuEffect.powG, ccuEffect.powB);
	}

	var guiCC = guiPP.addFolder('Color Correction');

	guiCC.add( CCpass, 'enabled').name('Enable');

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

		function getModel(key) { 
			if (assets.models[key]) 
				return assets.models[key].model; 
			else 
				return null;
		}

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
		// .addFile('emptyPlatformTex', '1024emptyPlatform.png')
		.addFile('emptyPlatform', 'emptyPlatform.obj')

		// hexagon platform  shell
		// .addFile('shellTex', '1024platformShell.png')
		.addFile('shell', 'platformShell.obj')

		// shore
		// .addFile('shorePlatformTex', 'shore/1024shorePlatform.png')
		.addFile('shorePlatform', 'shore/shorePlatform.obj')

		.addFile('shoreWaterSurfaceTex', 'shore/1024shoreWaterSurface.png')
		.addFile('shoreWaterSurface', 'shore/shoreWaterSurface.obj')

		// wind turbine
		// .addFile('turbineBaseTex', 'turbine/1024turbineBase.png')
		.addFile('turbineBase', 'turbine/turbineBase.obj')

		// .addFile('propellerTex', 'turbine/1024propeller.png')
		.addFile('propeller', 'turbine/propeller.obj')

		// hub
		// .addFile('hubPlatformTex', 'hub/1024hubplatform.png')
		.addFile('hubPlatform', 'hub/hubplatform.obj')

		.addFile('hubWindowTex', 'hub/1024hubwindow.png')
		.addFile('hubWindow', 'hub/hubwindow.obj')

		.addFile('hubStreetLine', 'hub/hubstreetline.obj')

		// city 01
		// .addFile('city01Tex', 'city01/1024city01.png')
		.addFile('city01', 'city01/city01.obj')

		// tollway
		// .addFile('tollwayTex', 'tollway/1024tollway.png')
		.addFile('tollway', 'tollway/tollway.obj')

		.addFile('tollwayLine', 'tollway/tollwayline.obj')

		// city 02 
		// .addFile('city02Tex', 'city02/1024city02.png')
		.addFile('city02', 'city02/city02.obj')

		// city 03 
		// .addFile('city03Tex', 'city03/1024city03.png')
		.addFile('city03', 'city03/city03.obj')

		// resident 01
		// .addFile('resident01Tex', 'resident01/1024resident01.png')
		.addFile('resident01', 'resident01/resident01.obj')

		// resident 02
		// .addFile('resident02Tex', 'resident02/1024resident02.png')
		.addFile('resident02', 'resident02/resident02.obj')

		// landfill
		.addFile('landfillTex', 'landfill/1024landfill.png')
		.addFile('landfill', 'landfill/landfill.obj')

		.addFile('landfillPipeTex', 'landfill/1024landfillPipe.png')
		.addFile('landfillPipe', 'landfill/landfillPipe.obj')

		.addFile('landfillWindowTex', 'landfill/1024landfillWindow.png')
		.addFile('landfillWindow', 'landfill/landfillWindow.obj')

		// water supply
		.addFile('watersupply', 'watersupply/watersupply.obj')

		.addFile('watersupplyPipeTex', 'watersupply/1024watersupplyPipe.png')
		.addFile('watersupplyPipe', 'watersupply/watersupplyPipe.obj')

		.addFile('lensflareTex', 'lensflare2.png')


	;




// initialize loading manager

	var loadingBar = document.getElementById('loading');

	var totalItems;
	var loadedItems;
	var loadingManager = new THREE.LoadingManager();
		console.time('loadingManager');
		loadingManager.onProgress = function ( item, loaded, total ) {
			// console.log( item, loaded, total );
			totalItems = total;
			loadedItems = loaded;
			var percentageCompleted = loaded/total * 100;
			loadingBar.style.width = percentageCompleted + '%';
		};
		loadingManager.onError = function () {
			console.error('Error: loading assets');
		};
		loadingManager.onLoad = function () {
			console.log(loadedItems + '/' + totalItems + ' assets loaded');
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

	function startScene() {

		setupWorld();
		// set default view
		animateCityView();
	}

	function render(time) {
		requestAnimationFrame(render);
		stats.update();
		TWEEN.update(time);
		animate(time);
		
		intersectMouse(world);

		// renderer.render(scene, camera);
		composer.render();

	}



	// ------ prototype function


		// --- test ray caster 3D object-mouse intersection todo: check platform's children if contain intersected mesh then do sth

		var prevIntersected = null;

			var raycaster = new THREE.Raycaster();
			function intersectMouse(mesh) {
				
				var mo = new THREE.Vector3( mouse.x, mouse.y, 1 ).unproject( camera );


				raycaster.set( camera.position, mo.sub( camera.position ).normalize() );

				// var intersects = raycaster.intersectObject( mesh , true ); // also check all descendants

				var objArr = _.toArray(mesh);
					objArr = _.without(objArr, world.sky);
				var intersects = raycaster.intersectObjects( objArr , true ); // also check all descendants

				if ( intersects.length > 0 ) {

					// console.log(intersects[0].object.parent.children.length);
					var closestMesh = intersects[0].object;

					var rootModel = getRootModel(closestMesh);
					
					
					intersected = rootModel.name;

					if (prevIntersected === intersected) return;

					// var iMat = getAllMaterials(rootModel);
					// _.forEach(iMat, function (value, key, list) {
					// 	value.wireframe = true;
					// });

					prevIntersected = intersected;	
					// console.log(intersected);


				}
			}

			function getRootModel(object) {
				if ( object.parent && !(object.parent instanceof THREE.Scene) ) {
					return getRootModel(object.parent);
				}
				return object;
			}

			function getAllMaterials(object) {

				var mat = [];

				if (object.material) mat.push(object.material);

				for (var i=0; i<object.children.length; i++) {

					mat = mat.concat( getAllMaterials(object.children[i]) );

				}

				return mat;

			}




function setupWorld() {

	// Experimental stuff
		// // test sea shader 

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

	// ------- Model helper

	THREE.Object3D.prototype.setDefaultPos = function(x, y, z, rx, ry, rz) {
		this.position.set(x, y, z);
		this.oripos = this.position.clone();
		this.orirot = this.rotation.clone();
		if (rx && ry && rz) {
			this.rotation.set(rx, ry, rz);
			this.orirot = this.rotation.clone();
		}
	};

	// override default clone to also clone material
	THREE.Object3D.prototype.clone = function(object, recursive) { 

		if ( object === undefined ) object = new THREE.Object3D();
		if ( recursive === undefined ) recursive = true;

		object.name = this.name;

		object.up.copy( this.up );

		object.position.copy( this.position );
		object.quaternion.copy( this.quaternion );
		object.scale.copy( this.scale );

		object.renderDepth = this.renderDepth;

		object.rotationAutoUpdate = this.rotationAutoUpdate;

		object.matrix.copy( this.matrix );
		object.matrixWorld.copy( this.matrixWorld );

		object.matrixAutoUpdate = this.matrixAutoUpdate;
		object.matrixWorldNeedsUpdate = this.matrixWorldNeedsUpdate;

		if (object.material && this.material) {
			object.material = this.material.clone();
		}

		object.visible = this.visible;

		object.castShadow = this.castShadow;
		object.receiveShadow = this.receiveShadow;

		object.frustumCulled = this.frustumCulled;

		object.userData = JSON.parse( JSON.stringify( this.userData ) );

		if ( recursive === true ) {

			for ( var i = 0; i < this.children.length; i ++ ) {

				var child = this.children[ i ];
				object.add( child.clone() );

			}

		}

		return object;
	};

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

	constructModel('emptyPlatform', {color: 0xddddee});
	var shell = constructModel('shell', {color: 0xddddee});
	shell.castShadow = false;
	shell.receiveShadow = false;

	function getNewShell() {
		return assetManager.getModel('shell').clone(); 
	}


	function getNewPlatform() {
		return assetManager.getModel('emptyPlatform').clone();;
	}


	// -------- World stuff

	world.sky = initSky(); // do magic by zz85

	world.shore1 = (function () {

		var shore = new THREE.Object3D();
		var shorePlatform = constructModel('shorePlatform', {color: 0xddddee});
		var shoreWaterSurface = constructModel('shoreWaterSurface', {map:'shoreWaterSurfaceTex' , envMap: 'reflectionCube', opacity: 0.7, transparent: true});
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
	
	// add turbines to shore1
		var allTurbines = new THREE.Object3D();
		var windTurbine = new THREE.Object3D();
		var turBase = constructModel('turbineBase', {color: 0xddddee});
		var turPro = constructModel('propeller', {color: 0xddddee});
		turPro.position.set(0, 268, -10);

		windTurbine.add(turBase);
		windTurbine.add(turPro);
		
		var windTurbine2 = windTurbine.clone();
		var windTurbine3 = windTurbine.clone();

		// relative postiton
		windTurbine.position.set(-223, 90, -75);
		windTurbine2.position.set(-22, 90, 40);
		windTurbine3.position.set(175, 90, 153);

		windTurbine.rotation.y = 
		windTurbine2.rotation.y = 
		windTurbine3.rotation.y = THREE.Math.degToRad(110);

		allTurbines.add(windTurbine, windTurbine2, windTurbine3);

		world.shore1.add(allTurbines);

		world.shore1.spinTurbines = function () {
			windTurbine.children[1].rotation.z += 0.05;
			windTurbine2.children[1].rotation.z += 0.05;
			windTurbine3.children[1].rotation.z += 0.05;
		};
		
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
		var lfbuilding = constructModel('landfill', {map: 'landfillTex'});
		var lfpipe = constructModel('landfillWindow', {map: 'landfillWindowTex', envMap: 'reflectionCube'})
		var lfwindow = constructModel('landfillPipe', {map: 'landfillPipeTex', envMap: 'reflectionCube', reflectivity: 0.4})
		lfbuilding.position.x = lfpipe.position.x = lfwindow.position.x = -30;
		var ep = getNewPlatform(); 
		var lfshell = getNewShell();
		landfill.add(lfbuilding, lfpipe, lfwindow, ep, lfshell);
		landfill.setDefaultPos(1400, 0, -805);
		return landfill;

	})();

	world.watersupply = (function () {

		var watersupply = new THREE.Object3D();
		var ws = constructModel('watersupply', {color: 0xddddee});
		var wp = constructModel('watersupplyPipe', {map: 'watersupplyPipeTex', envMap: 'reflectionCube', reflectivity: 0.6})
		var shell = getNewShell();
		watersupply.add(ws, wp, shell);
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
		var ep = getNewPlatform();
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
		object.name = getModelName(object);
		scene.add(object);
	});

	function getModelName(model) {
		var k;
		_.each(world, function (value, key, list) {
			if (value === model) {
				k = key;
			}
		});
		return k;
	}




	// test lens flare

	// // var material = new THREE.SpriteMaterial( { 
	// // 	blending: THREE.AdditiveBlending, 
	// // 	map:assetManager.getTexture('lensflareTex'),
	// // 	opacity: 0.9,
	// // 	transparent: true,
	// // } );

	var flareColor = new THREE.Color( 0xffffff );
	// flareColor.setHSL( h, s, l + 0.5 );
	var lensFlare = new THREE.LensFlare( assetManager.getTexture('lensflareTex'),
										 700, 0.0, THREE.AdditiveBlending, flareColor );

	// lensFlare.position.copy(sunLight.position);
	scene.add( lensFlare );




} // end setup world
	/*jshint unused: false */

	var currView = 'city';

	function animate(time) {

		// seaShaderUniforms.time.value = time*0.0005;

		world.shore1.spinTurbines();

		// if (currView === 'waterNetwork') {
		// 	world.watersupply.rotation.y += 0.01;
		// 	if (world.watersupply.rotation.y > Math.PI*2.0) {
		// 		world.watersupply.rotation.y = 0;
		// 	}
		// }


		// if (guiSky && guiCC) {
		// 	for (var i in guiSky.__controllers) {
		// 		guiSky.__controllers[i].updateDisplay();
		// 	}
		// 	for (var i in guiCC.__controllers) {
		// 		guiCC.__controllers[i].updateDisplay();
		// 	}
		// }
		
		
	}

	// Gui auto update

	function updateGuiSky() {
		for (var i in guiSky.__controllers) {
			guiSky.__controllers[i].updateDisplay();
		}
	}

	function updateGuiLight() {
		sunLightColor.color = '#' + sunLight.color.getHexString();
		for (var i in guiDebug.__controllers) {
			guiDebug.__controllers[i].updateDisplay();
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

		function animateSky(a, b, c, d, e, f, g, speed) {
			var sky = world.sky;
			new TWEEN.Tween( sky.ctrl )
				.to( {	turbidity: a,
						reileigh: b,
						mieCoefficient: c,
						mieDirectionalG: d,
						liminance: e,
						inclination: f,
						azimuth: g
					 }, speed || 5000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() {
					sky.updateCtrl();
					updateGuiSky();
				})
			.start();
		}

		function animateSunLightIntensity(x) {
			new TWEEN.Tween( sunLight )
				.to( { intensity: x }, 3000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() {
					updateGuiLight();
				})
			.start();
		}

		function animateClearSky() {
			animateSky(18.9, 4, 0.063, 0.94, 0.35, 0.86, 0.9);
		}

		function animateSunsetSky() {
			animateSky(20, 4, 0.1, 0.93, 0.11, 0.5, 0.65);
		}

		function animateSunsetSky2(speed) {
			animateSky(20, 4, 0.1, 0.93, 0.35, 0.49, 0.86, speed);
		}


	// --------- City Views Animation

		function resetView() {
			if (currView === 'waterNetwork') {
				world.watersupply.animateResetPos();
			}
		}

		function animateCityView() {

			resetView();

			animateCameraTo(new THREE.Vector3(-350.15 , -278.71 , -5.32), 
							new THREE.Vector3(-1830.50 , 2112.81 , -25.24));

			animateFOV(80);
			animateClearSky();
			animateSunLightIntensity(1);


			currView = 'city';

		}

		function animateTollwayView() {

			resetView();

			animateCameraTo(new THREE.Vector3(215.35 , 70.55 , 1377.40), 
							new THREE.Vector3(-570.12 , 216.03 , -188.98));

			animateFOV(100);
			animateSunsetSky();
			animateSunLightIntensity(0, 0, 0);


			currView = 'tollway';

		}

		function animateTollwayView2() {

			resetView();

			animateCameraTo(new THREE.Vector3(-1568.77 , -343.81 , 262.49), 
							new THREE.Vector3(-134.94 , 246.37 , -75.15), 5000);

			animateFOV(110);
			animateSunsetSky2();
			animateSunLightIntensity(0, 0, 0);


			currView = 'tollway';

		}

		function animateLowAngleView() {

			resetView();

			animateCameraTo(new THREE.Vector3(-31.30, 581.13, 372.64), 
							new THREE.Vector3(-462.15, 171.85, -245.54));

			animateFOV(120);
			animateClearSky();
			animateSunLightIntensity(1);

			currView = 'lowAngle';

		}

		function animateTurbinesView() {

			resetView();

			animateCameraTo(new THREE.Vector3(-1005.12 , 91.27 , 865.27), 
							new THREE.Vector3(-1859.96 , 453.77 , 1066.81));

			animateFOV(90);
			animateClearSky();
			animateSunLightIntensity(1);


			currView = 'turbines';

		}

		function animateLandfillView() {

			resetView();

			animateCameraTo(new THREE.Vector3(1538.19 , -314.89 , 245.60), 
							new THREE.Vector3(989.74 , 481.44 , -1133.21));

			animateFOV(80);
			animateClearSky();
			animateSunLightIntensity(1);


			currView = 'landfill';

		}

		function animateWaterNetworkView() {

			resetView();

			animateCameraTo(new THREE.Vector3(854.92 , 415.85 , 514.55), 
							new THREE.Vector3(-60.48 , 697.84 , 524.37));

			animateFOV(80);
			animateClearSky();
			animateSunLightIntensity(1);

			world.watersupply.animateY(700);
			

			currView = 'waterNetwork';

		}

		function animateLowFOV() {

			resetView();

			animateCameraTo(new THREE.Vector3(-46.34 , 671.43 , -89.42), 
							new THREE.Vector3(-15534.92 , 862.24 , 4259.24));

			animateFOV(5);
			animateClearSky();
			animateSunLightIntensity(1);


			currView = 'lowFOV';

		}


	// view ctrl GUI

		
		var viewCtrl = {
			lowFOV: animateLowFOV,
			city: animateCityView,
			turbines: animateTurbinesView,
			landfill: animateLandfillView,
			waterNetwork: animateWaterNetworkView,
			tollway: animateTollwayView2,
			lowAngle: animateLowAngleView
		};

		guiViews.add(viewCtrl, 'lowFOV');
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
		if (event.keyCode === 102) {	// if 'F' is pressed
			event.preventDefault();
			THREEx.FullScreen.request();
		}
	});

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

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	function onDocumentMouseMove( event ) {
		event.preventDefault();
		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	}

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
		turbidity: 18.9,
		reileigh: 4,
		mieCoefficient: 0.063,
		mieDirectionalG: 0.94,
		luminance: 0.35,
		inclination: 0.86,
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


		var lightDist = 3000;
		theta += 0.2;
		sunLight.position.x = lightDist * Math.cos(phi);
		sunLight.position.y = lightDist * Math.sin(phi) * Math.sin(theta); 
		sunLight.position.z = lightDist * Math.sin(phi) * Math.cos(theta); 

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