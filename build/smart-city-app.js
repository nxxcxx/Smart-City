"use strict";
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

THREE.Object3D.prototype.setDefaultPos = function(x, y, z, rx, ry, rz) {
	this.position.set(x, y, z);
	this.oripos = this.position.clone();
	this.orirot = this.rotation.clone();
	if (rx && ry && rz) {
		this.rotation.set(rx, ry, rz);
		this.orirot = this.rotation.clone();
	}
};

// animation methods
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
			shadowDarkness: 0.6,
			maxAnisotropy: null

		};


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

		var debugInfo = $('.debug-info');
		var statsDOM = $('#stats');
		var toggleDebugInfo = {value: false}; debugInfo.css('visibility', 'hidden');
		var toggleStats = {value: true};
		guiGeneral.add(toggleStats, 'value').name('FPS').onChange( function(bool) {
			if (bool) { statsDOM.css('visibility', 'visible');} 
			else { statsDOM.css('visibility', 'hidden');}
		});
		guiGeneral.add(toggleDebugInfo, 'value').name('System Info').onChange( function(bool) {
			if (bool) {debugInfo.css('visibility', 'visible');} 
			else {debugInfo.css('visibility', 'hidden');}
		});


		guiGeneral.add(scene_settings, 'enableHelper').name('Visual Helper').onChange( toggleHelper );


// ---- Lights

	var SHADOW_MAP_WIDTH = scene_settings.shadowMapSize, SHADOW_MAP_HEIGHT = scene_settings.shadowMapSize;

	// sun light
	var sunlight = new THREE.DirectionalLight(0xffffff, 1.0);	//0x331100

	// sunlight pos now control by sky
	// var sunlightDir = new THREE.Vector3(-4000, 3000, 3000);
	// var sunlightDist = 1000;
	// sunlight.position.set( sunlightDir.normalize().multiplyScalar(sunlightDist) );

		sunlight.castShadow = true;

		sunlight.shadowCameraNear = 8000;
		sunlight.shadowCameraFar = 12000;

		sunlight.shadowCameraLeft = -2000;
		sunlight.shadowCameraRight = 2000;
		sunlight.shadowCameraTop = 2000;
		sunlight.shadowCameraBottom = -2000;

		sunlight.shadowCameraVisible = true;

		sunlight.shadowCameraFov = 80;
		sunlight.shadowBias = 0.0001;
		sunlight.shadowDarkness = scene_settings.shadowDarkness;

		sunlight.shadowMapWidth = SHADOW_MAP_WIDTH;
		sunlight.shadowMapHeight = SHADOW_MAP_HEIGHT;

		var sunlightColor = {color: '#ffffff'};
		var guiSunlight = guiDebug.addFolder('Sunlight');
		guiSunlight.add(sunlight, 'intensity', 0.0, 3.0, 0.1);
		guiSunlight.addColor(sunlightColor, 'color').name('color').onChange(updateLightCol);
		function updateLightCol(c) {
			sunlight.color.set(c);
		}


	scene.add(sunlight);


	// back light
	var backLight = new THREE.DirectionalLight(0xffffff, 0.5);
	backLight.position.set(1000, 1000, -1500);

	var backLightHelper = new THREE.DirectionalLightHelper(backLight, 100);
	scene.add(backLightHelper);
	scene.add(backLight);

	// front light (for turbine views light compensation)
	var frontLight = new THREE.DirectionalLight(0xffffff, 2.0);
	frontLight.position.set(-3500, 500, 2500);
	scene.add(frontLight);

	// var frontLightHelper = new THREE.DirectionalLightHelper(frontLight, 100);
	// scene.add(frontLightHelper);



	// // ambient light
	var ambLight = new THREE.AmbientLight(0x050506);
	scene.add(ambLight);

	function toggleHelper() {
		axisHelper.visible = scene_settings.enableHelper;
		grid.visible = scene_settings.enableHelper;
		sunlight.shadowCameraVisible = scene_settings.enableHelper;
		backLightHelper.visible = scene_settings.enableHelper;
	} 
	toggleHelper();

// ---- Post-Processing

	// Render
		var renderPass = new THREE.RenderPass( scene, camera );

	// SSAO
		var depthShader = THREE.ShaderLib["depthRGBA"];
		var depthUniforms = THREE.UniformsUtils.clone( depthShader.uniforms );
		var depthMaterial = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms } );
		depthMaterial.blending = THREE.NoBlending;

		var depthTarget = new THREE.WebGLRenderTarget( 1024, 1024, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat } );

		var SSAOpass = new THREE.ShaderPass( THREE.SSAOShader );
		SSAOpass.uniforms[ 'tDepth' ].value = depthTarget;
		SSAOpass.uniforms[ 'size' ].value.set( 1024, 1024 );
		SSAOpass.uniforms[ 'cameraNear' ].value = camera.near;
		SSAOpass.uniforms[ 'cameraFar' ].value = 10000;
		SSAOpass.uniforms[ 'aoClamp' ].value = 0.59;
		SSAOpass.uniforms[ 'lumInfluence' ].value = 1.06;
		SSAOpass.uniforms[ 'onlyAO' ].value = 0;	// debug
	
	// FXAA
		var FXAApass = new THREE.ShaderPass( THREE.FXAAShader );
		FXAApass.uniforms['resolution'].value.set(1 / (screenWidth * dpr), 1 / (screenHeight * dpr));

	// Color Correction
		var CCpass = new THREE.ShaderPass( THREE.ColorCorrectionShader );

	// Bleach Bypass & E6C41
		var CCNIXpass = new THREE.ShaderPass( THREE.ColorCorrectionShaderNIX );

	// Copy to screen
		var copyPass = new THREE.ShaderPass( THREE.CopyShader );
		copyPass.renderToScreen = true;

	// test convolution gaussian blur
		// var cvPass = new THREE.ShaderPass( THREE.ConvolutionShader );
		// cvPass.uniforms['cKernel'].value = [1/16, 2/16, 1/16, 2/16, 4/16, 2/16, 1/16, 2/16, 1/16];


	// Composer
		var composer = new THREE.EffectComposer( renderer );
		composer.setSize(screenWidth * dpr, screenHeight * dpr);

		composer.addPass(renderPass);
		
		composer.addPass(SSAOpass);
		composer.addPass(FXAApass);
		composer.addPass(CCpass);
		composer.addPass(CCNIXpass);

		// composer.addPass(cvPass);

		composer.addPass(copyPass);



	// Post-Processing GUI

		guiPP.open();


		// FXAA
		guiPP.add( FXAApass, 'enabled').name('FXAA');


		// SSAO
		var onlyAO = {value: false};
		var guiSSAO = guiPP.addFolder('SSAO');
		guiSSAO.add( SSAOpass, 'enabled').name('Enable');
		guiSSAO.add( onlyAO, 'value').name('Show RAW').onChange( function(bool) {
			SSAOpass.uniforms[ 'onlyAO' ].value = bool ? 1 : 0;
		});
		guiSSAO.add( SSAOpass.uniforms.aoClamp, 'value', 0.0, 1.0).name('Clamp');
		guiSSAO.add( SSAOpass.uniforms.lumInfluence, 'value', -2.0, 2.0).name('LumInfluence');


		// Bleach Bypass & E6C41
		var guiBleach = guiPP.addFolder('Bleach Bypass & E6C41');
		guiBleach.add( CCNIXpass, 'enabled').name('Enable');
		guiBleach.add( CCNIXpass.uniforms.uOpacity, 'value', 0.0, 2.0, 0.1).name('Bleach Bypass');
		guiBleach.add( CCNIXpass.uniforms.uOpacity2, 'value', 0.0, 2.0, 0.1).name('E6C41');

		
		// Color Correction
		var ccu = CCpass.uniforms;

		var ccuEffect = {
			exposure: 1.0,
			powR: 1.0,
			powG: 1.0,
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

		guiCC.add( CCpass, 'enabled').name('Enable');

		guiCC.add( ccu.exposure, 'value', 0.0, 5.0, 0.01).name('Exposure');
		guiCC.add( ccuEffect, 'powR', 1.0, 3.0, 0.01).onChange(adjustCC);
		guiCC.add( ccuEffect, 'powG', 1.0, 3.0, 0.01).onChange(adjustCC);
		guiCC.add( ccuEffect, 'powB', 1.0, 3.0, 0.01).onChange(adjustCC);
		guiCC.add( ccuEffect, 'mulR', 1.0, 3.0, 0.01).onChange(adjustCC);
		guiCC.add( ccuEffect, 'mulG', 1.0, 3.0, 0.01).onChange(adjustCC);
		guiCC.add( ccuEffect, 'mulB', 1.0, 3.0, 0.01).onChange(adjustCC);
		adjustCC();

	var assetManager = (function assetManager() {

		var texPath = 'assets/';
		var imgFormat = ['.jpg', '.png'];

		var modelPath = 'assets/';
		var modelFormat = '.obj';

		var assets = {
			textures: {},
			models: {},
			materials: {}
		};

		function containsFormat(file, format) {

			if (format instanceof Array) {
				for (var i=0; i<format.length; i++) {
					 if ( file.indexOf(format[i]) !== -1 ) {
					 	return true;
					 }
				}
			} else {
				if ( file.indexOf(format) !== -1 ) {
					return true;
				}
			}

			return false;

		}

		function addFile(key, filename) {

			var ast;
			if ( containsFormat(filename, imgFormat) ) {	// if png file
				ast = assets.textures[key] = {};
				ast.texUrl = texPath + filename;
				ast.texture = null;
				ast.type = null;
			} 
			else if ( containsFormat(filename, modelFormat) ) {	// if obj file
				ast = assets.models[key] = {};
				ast.modelUrl = modelPath + filename;
				ast.model = null;
			}
			
			return this;
		}

		function addSkybox(key, urlArr) {

			var ast = assets.textures[key] = {};
			ast.texUrl = urlArr;
			ast.texture = null;
			ast.type = 'cube';

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
			addTexture: addTexture,
			addSkybox: addSkybox
		};

	})();


	// Skybox texture
	var skyboxPath = "assets/skybox/";
	var skyboxFormat = '.png';
	var skyboxUrls = [
		skyboxPath + 'px' + skyboxFormat, skyboxPath + 'nx' + skyboxFormat,
		skyboxPath + 'py' + skyboxFormat, skyboxPath + 'ny' + skyboxFormat,
		skyboxPath + 'pz' + skyboxFormat, skyboxPath + 'nz' + skyboxFormat
	];


	assetManager

		// Skybox
		.addSkybox('reflectionCube', skyboxUrls)

		// empty hexagon platform 
		.addFile('emptyPlatform', 'platform/emptyPlatform.obj')

		// hexagon platform  shell
		.addFile('shell', 'platform/platformShell.obj')

		// shore
		.addFile('shorePlatform', 'shore/shoreSlope.obj')

		.addFile('shoreWaterSurfaceTex', 'shore/1024shoreWaterSurface.png')
		.addFile('shoreWaterSurface', 'shore/shoreWaterSurface.obj')

		// wind turbine
		// .addFile('turbineBaseTex', 'turbine/xxxxxxxxxx.png')
		.addFile('turbineBase', 'turbine/turbineBase.obj')

		// .addFile('propellerTex', 'turbine/xxxxxxxxxx.png')
		.addFile('propeller', 'turbine/propeller.obj')

		// hub
		// .addFile('hubPlatformTex', 'hub/xxxxxxxxxx.png')
		.addFile('hubPlatform', 'hub/hubplatform_no_base.obj')

		.addFile('hubWindowTex', 'hub/1024hubwindow.png')
		.addFile('hubWindow', 'hub/hubwindow.obj')

		.addFile('hubStreetLine', 'hub/hubstreetline.obj')

		// tollwayi
		// .addFile('tollwayTex', 'tollway/xxxxxxxxxx.png')
		.addFile('tollway', 'tollway/tollway_no_base.obj')
		.addFile('tollwayLine', 'tollway/tollwayline.obj')

		// city 01
		// .addFile('city01Tex', 'city01/xxxxxxxxxx.png')
		.addFile('city01', 'city01/city01_no_base.obj')

		// city 02 
		// .addFile('city02Tex', 'city02/xxxxxxxxxx.png')
		.addFile('city02', 'city02/city02_no_base.obj')

		// city 03 
		// .addFile('city03Tex', 'city03/xxxxxxxxxx.png')
		.addFile('city03', 'city03/city03_no_base.obj')

		// resident 01
		// .addFile('resident01Tex', 'resident01/xxxxxxxxxx.png')
		.addFile('resident01', 'resident01/resident01_no_base.obj')

		// resident 02
		// .addFile('resident02Tex', 'resident02/xxxxxxxxxx.png')
		.addFile('resident02', 'resident02/resident02_no_base.obj')

		// landfill
		.addFile('landfillBuildingTex', 'landfill/building1k.png')
		.addFile('landfillBuilding', 'landfill/landfillBuilding.obj')

		.addFile('landfillDirtTex', 'landfill/dirt1k.png')
		.addFile('landfillDirt', 'landfill/landfillDirt.obj')

		.addFile('landfillPipeTex', 'landfill/1024landfillPipe.png')
		.addFile('landfillPipe', 'landfill/landfillPipe.obj')

		.addFile('landfillWindowTex', 'landfill/1024landfillWindow.png')
		.addFile('landfillWindow', 'landfill/landfillWindow.obj')

		// water supply
		.addFile('watersupply', 'watersupply/watersupply_no_base.obj')

		.addFile('watersupplyPipeTex', 'watersupply/1024watersupplyPipe.png')
		.addFile('watersupplyPipe', 'watersupply/watersupplyPipe.obj')

		// lens flare
		.addFile('lensdirtTex', 'lensflare/lensdirt01.png')
		.addFile('lensFlare01Tex', 'lensflare/lensflare01.png')
		.addFile('lensFlareHoopTex', 'lensflare/lensflareHoop.png')

		// ocean
		.addFile('oceanSurface', 'ocean/oceanSurfaceSubdivided.obj')


	;




// initialize loading manager

	var loadingBar = $('#loading');

	var totalItems;
	var loadedItems;
	var loadingManager = new THREE.LoadingManager();
		console.time('loadingManager');
		loadingManager.onProgress = function ( item, loaded, total ) {
			// console.log( item, loaded, total );
			totalItems = total;
			loadedItems = loaded;
			var percentageCompleted = loaded/total * 100;
			loadingBar.css('width', percentageCompleted + '%');
		};
		loadingManager.onError = function () {
			console.error('Error: loading assets');
		};
		loadingManager.onLoad = function () {
			console.log(loadedItems + '/' + totalItems + ' assets loaded');
			console.timeEnd('loadingManager');
			loadingBar.css('display', 'none');
			startScene();
			initDebugInfo();
			render();
		};

	var textureLoader = new THREE.ImageLoader(loadingManager);
	var OBJloader = new THREE.OBJLoader(loadingManager);


// iterate through each asset, then load and store it
	_.each(assetManager.get().textures, function(textureAsset) {

		if (textureAsset.type === 'cube') {

			textureAsset.texture = loadTextureCube(textureAsset.texUrl);

		} else {

			textureLoader.load( textureAsset.texUrl, function (image) {
				textureAsset.texture = new THREE.Texture(image);
				textureAsset.texture.needsUpdate = true;
			});

		}

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


// loader helper

	function loadTextureCube(arrayURL, mapping, onLoad) {

		var images = [];

		var loader = new THREE.ImageLoader(loadingManager);

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
		// animateSilhouetteView();

	}

	var debugCTGT = $('.ctgt');
	var debugCPOS = $('.cpos');
	var debugFOV  = $('.fov');
	var debugGL = $('.debug-gl');

	function initDebugInfo() {

		var gl = renderer.context;
		debugGL.html(
			'Version: ' + gl.getParameter(gl.VERSION) + '<br/>' + 
			'Shading language: ' + gl.getParameter(gl.SHADING_LANGUAGE_VERSION) + '<br/>' +
			'Vendor: ' + gl.getParameter(gl.VENDOR) + '<br/>' +
			'Renderer: ' + gl.getParameter(gl.RENDERER) + '<br/>'
		);

	}

	function updateDebugCamera() {
		if (!toggleDebugInfo.value) return;
		debugCTGT.html( 'CTGT: ' + cameraCtrl.target.x.toFixed(2) + ', '+ cameraCtrl.target.y.toFixed(2) + ', ' + cameraCtrl.target.z.toFixed(2) );
		debugCPOS.html( 'CPOS: ' + cameraCtrl.object.position.x.toFixed(2) + ', ' + cameraCtrl.object.position.y.toFixed(2) + ', ' + cameraCtrl.object.position.z.toFixed(2) );
		debugFOV.html( 'CFOV: ' + camera.fov.toFixed(2) );
	}

	function mapToRange(x, a, b, c, d) {
		return (x-a)/(b-a)*(d-c) + c;
	}

	function render(time) {

		requestAnimationFrame(render);
		TWEEN.update(time);
		animate(time);

		// intersectMouse(world);

		updateDebugCamera();

		// world to screenPos
			// var sp = world.city01.position.clone();
			// sp.project(camera);
			// // console.log(sp.x, sp.y, sp.z);
			// $('#screen-coords').css({ 
			// 	top:  mapToRange(-sp.y, -1, 1, 0, screenHeight),
			// 	left: mapToRange(sp.x, -1, 1, 0, screenWidth)
			// });


		// render depth to target [ override > render > restore]
			scene.overrideMaterial = depthMaterial;
			world.lensflare.visible = false; // temporaily disable lens flare, it destroys my depth pass
			world.ocean.oceanMesh.visible = false; // no depthWrite for ocean
			world.sky.visible = false;

			renderer.render(scene, camera, depthTarget, true); // force clear

			// renderer.render(scene, camera);	// show depth pass

			scene.overrideMaterial = null;
			world.lensflare.visible = true;
			world.sky.visible = true;
			world.ocean.oceanMesh.visible = true;

		// render composited passes
		composer.render();


		stats.update();

	}



	// ------ prototype function


		// --- test ray caster 3D object-mouse intersection todo: check platform's children if contain intersected mesh then do sth

		// var prevIntersected = null;

		// 	var raycaster = new THREE.Raycaster();
		// 	function intersectMouse(mesh) {
				
		// 		var mo = new THREE.Vector3( mouse.x, mouse.y, 1 ).unproject( camera );


		// 		raycaster.set( camera.position, mo.sub( camera.position ).normalize() );

		// 		// var intersects = raycaster.intersectObject( mesh , true ); // also check all descendants

		// 		var objArr = _.toArray(mesh);
		// 			objArr = _.without(objArr, world.sky);
		// 		var intersects = raycaster.intersectObjects( objArr , true ); // also check all descendants

		// 		if ( intersects.length > 0 ) {

		// 			// console.log(intersects[0].object.parent.children.length);
		// 			var closestMesh = intersects[0].object;

		// 			var rootModel = getRootModel(closestMesh);
					
					
		// 			intersected = rootModel.name;

		// 			if (prevIntersected === intersected) return;

		// 			// var iMat = getAllMaterials(rootModel);
		// 			// _.forEach(iMat, function (value, key, list) {
		// 			// 	value.wireframe = true;
		// 			// });

		// 			prevIntersected = intersected;	
		// 			// console.log(intersected);


		// 		}
		// 	}

		// 	function getRootModel(object) {
		// 		if ( object.parent && !(object.parent instanceof THREE.Scene) ) {
		// 			return getRootModel(object.parent);
		// 		}
		// 		return object;
		// 	}

		// 	function getAllMaterials(object) {

		// 		var mat = [];

		// 		if (object.material) mat.push(object.material);

		// 		for (var i=0; i<object.children.length; i++) {

		// 			mat = mat.concat( getAllMaterials(object.children[i]) );

		// 		}

		// 		return mat;

		// 	}




function setupWorld() {

	var defaultColor = 0xddddee;

	// ------- Model helper

		constructModel('emptyPlatform', { color: defaultColor });

		var shell = constructModel('shell', { color: defaultColor });
		shell.castShadow = false;
		shell.receiveShadow = false;

		function constructModel(modelKey, settings) {

			var model = assetManager.getModel(modelKey);

			var material = new THREE.MeshLambertMaterial({
				shading: THREE.FlatShading
			});

			_.each(settings, function(value, key) {

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


		function getNewPlatform() {
			return assetManager.getModel('emptyPlatform').clone();
		}


	// -------- World stuff

		world.sky = initSky(); // do magic by zz85


		world.lensflare = initLensflare();


			// test skybox
				var shader = THREE.ShaderLib[ "cube" ];
				shader.uniforms[ "tCube" ].value = assetManager.getTexture('reflectionCube');

				var material = new THREE.ShaderMaterial( {

					fragmentShader: shader.fragmentShader,
					vertexShader: shader.vertexShader,
					uniforms: shader.uniforms,
					side: THREE.BackSide,
					depthWrite: false,
					blending: THREE.MultiplyBlending,
					transparent: true,
					opacity: 1.0,

				} );

				world.skybox = new THREE.Mesh( new THREE.BoxGeometry( 1000000, 1000000, 1000000 ), material );


			// test floor
				// var mat = new THREE.MeshLambertMaterial({
				// 	color: defaultColor	
				// });
				// var geom = new THREE.PlaneBufferGeometry(1000000, 1000000, 1, 1);

				// geom.applyMatrix( new THREE.Matrix4().makeRotationX(-Math.PI/2) );

				// world.floor = new THREE.Mesh(geom, mat);
				// world.floor.position.y = 0;


		// *****************	test ocean

		var oceanGeom = assetManager.getModel('oceanSurface').geometry;
		world.ocean = initOcean(oceanGeom);
		world.ocean.setRotationY( - Math.PI/6.0 );
		world.ocean.setPosition(-760.47, 97.23, 1322.69);
		scene.add(world.ocean.oceanMesh);


		world.shore1 = (function () {

			var shore = new THREE.Object3D();
			var shorePlatform = constructModel('shorePlatform', {color: defaultColor});
			// var shoreWaterSurface = constructModel('shoreWaterSurface', {map:'shoreWaterSurfaceTex' , envMap: 'reflectionCube', opacity: 0.7, transparent: true});
			shorePlatform.castShadow = false;

			// shore.add(shorePlatform, shoreWaterSurface);

			shore.add(shorePlatform);
			shore.setDefaultPos(-1400, 0, 808);

			return shore;

		})();

		world.shore2 = (function () {

			var shore = world.shore1.clone();
			shore.setDefaultPos(-700, 0, 1214);
			return shore;

		})();

		world.shore3 = (function () {

			var shore = world.shore1.clone();
			shore.setDefaultPos(0, 0, 1618);
			return shore;

		})();
		
		// add turbines to shore1
			var allTurbines = new THREE.Object3D();
			var windTurbine = new THREE.Object3D();
			var turBase = constructModel('turbineBase', {color: defaultColor});
			var turPro = constructModel('propeller', {color: defaultColor});
			turPro.position.set(0, 370.5, -10);

			windTurbine.add(turBase);
			windTurbine.add(turPro);
			
			var windTurbine2 = windTurbine.clone();
			var windTurbine3 = windTurbine.clone();

			// relative postiton
			windTurbine.position.set(-223, 40, -75);
			windTurbine2.position.set(-22, 40, 40);
			windTurbine3.position.set(175, 40, 153);

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
			var hubWindow = constructModel('hubWindow', {map: 'hubWindowTex', envMap: 'reflectionCube', reflectivity: 0.8});
			var hubPlatform = constructModel('hubPlatform', {color: defaultColor});
			var hubStreetLine = constructModel('hubStreetLine', {emissive: 0x00aaff});
				hubStreetLine.castShadow = false;
				hubStreetLine.receiveShadow = false;
			var ep = getNewPlatform();
			var hubShell = getNewShell();
			hub.add(hubShell, hubPlatform, hubWindow, hubStreetLine, ep);
			hub.setDefaultPos(0, 0, 0);
			return hub;

		})();

		world.city01 = (function () {

			var city01 = new THREE.Object3D();
			var city01Buildings = constructModel('city01', {color: defaultColor});
			var city01Shell = getNewShell();
			var ep = getNewPlatform();
			city01.setDefaultPos(0, 0, -808);
			city01.add(city01Buildings, city01Shell, ep);
			return city01;

		})();

		world.city02 = (function () {

			var city02 = new THREE.Object3D();
			var city02Buildings = constructModel('city02', {color: defaultColor});
			var city02Shell = getNewShell();
			var ep = getNewPlatform();
			city02.setDefaultPos(700, 0, -405);
			city02.add(city02Buildings, city02Shell, ep);
			return city02;

		})();

		world.city03 = (function () {

			var city03 = new THREE.Object3D();
			var city03Buildings = constructModel('city03', {color: defaultColor});
			var city03Shell = getNewShell();
			var ep = getNewPlatform();
			city03.setDefaultPos(0, 0, 810);
			city03.add(city03Buildings, city03Shell, ep);
			return city03;

		})();
		
		world.tollway = (function () {

			var tollway = new THREE.Object3D();
			var tollwayStreet = constructModel('tollway', {color: defaultColor});
			var tollwayLine = constructModel('tollwayLine', {emissive: 0x00aaff});
				tollwayLine.castShadow = false;
				tollwayLine.receiveShadow = false;
			var ep = getNewPlatform();
			var tollwayShell = getNewShell();
			tollway.setDefaultPos(-702, 0, -403);
			tollway.add(tollwayStreet, tollwayLine, tollwayShell, ep);
			return tollway;

		})();
			
		world.landfill = (function () {

			var landfill = new THREE.Object3D();
			var lfbuilding = constructModel('landfillBuilding', {map: 'landfillBuildingTex'});
			var lfdirt = constructModel('landfillDirt', {map: 'landfillDirtTex'});
			var lfpipe = constructModel('landfillWindow', {map: 'landfillWindowTex', envMap: 'reflectionCube'});
			var lfwindow = constructModel('landfillPipe', {map: 'landfillPipeTex', envMap: 'reflectionCube', reflectivity: 0.4});
			lfbuilding.position.x = lfpipe.position.x = lfwindow.position.x = -30;
			var ep = getNewPlatform(); 
			var lfshell = getNewShell();
			landfill.add(lfbuilding, lfdirt, lfpipe, lfwindow, ep, lfshell);
			landfill.setDefaultPos(1400, 0, -805);
			return landfill;

		})();

		world.watersupply = (function () {

			var watersupply = new THREE.Object3D();
			var ws = constructModel('watersupply', {color: defaultColor});
			var wp = constructModel('watersupplyPipe', {map: 'watersupplyPipeTex', envMap: 'reflectionCube', reflectivity: 0.6});
			var shell = getNewShell();
			var ep = getNewPlatform(); 
			watersupply.add(ws, wp, shell, ep);
			watersupply.setDefaultPos(700, 0, 405);
			return watersupply;

		})();

		world.resident1 = (function () {

			var resident01 = new THREE.Object3D();
			var resident01Buildings = constructModel('resident01', {color: defaultColor});
			var ep = getNewPlatform();
			var resident01Shell = getNewShell();
			resident01.setDefaultPos(-700, 0, -1213);
			resident01.rotation.y = THREE.Math.degToRad(120);
			resident01.add(resident01Buildings, resident01Shell, ep);
			return resident01;

		})();

		world.resident2 = (function () {

			var resident02 = new THREE.Object3D();
			var resident02Buildings = constructModel('resident02', {color: defaultColor});
			var resident02Shell = getNewShell();
			var ep = getNewPlatform(); 
			resident02.setDefaultPos(-1400, 0, -809);
			resident02.add(resident02Buildings, resident02Shell, ep);
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


	// --- add to scene

		_.each(world, function (object) {

			object.name = getModelName(object);

			if (object instanceof THREE.Object3D) {
				scene.add(object);
			}
			
		});

		function getModelName(model) {
			var k;
			_.each( world, function (value, key) {
				if (value === model) {
					k = key;
				}
			});
			return k;
		}


} // end setup world

	var currView = 'city';

	function animate(time) {

		world.shore1.spinTurbines();
		world.ocean.updateOcean();

	}

	// Gui auto update

	function updateGuiSky() {
		for (var i in guiSky.__controllers) {
			guiSky.__controllers[i].updateDisplay();
		}
	}

	function updateGuiLight() {
		sunlightColor.color = '#' + sunlight.color.getHexString();
		for (var i in guiSunlight.__controllers) {
			guiSunlight.__controllers[i].updateDisplay();
		}
	}

	function updateGuiOcean() {
		for (var i in guiOcean.__controllers) {
			guiOcean.__controllers[i].updateDisplay();
		}
	}

	// -------- Main animation

		function setCamera(target, position) {
			cameraCtrl.target.copy(target);
			cameraCtrl.object.position.copy(position);
		}

		function animateCameraTo(target, position, speed, callback) {

			new TWEEN.Tween( cameraCtrl.target )
				.to( {	x: target.x,
						y: target.y,
						z: target.z
					 }, speed || 1000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() {
					cameraCtrl.update();
				})
			.start();

			new TWEEN.Tween( cameraCtrl.object.position )
				.to( {	x: position.x,
						y: position.y,
						z: position.z
					 }, speed || 1000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() {
					cameraCtrl.update();
				})
			.start()
			.onComplete(function() {
				if (callback) callback();
			});

		}

		function animateFOV(fov) {
			new TWEEN.Tween( camera )
				.to( {	fov: fov
					 }, 1000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() { 
					camera.updateProjectionMatrix();
				})
			.start();
		}

		function animateSky(a, b, c, d, e, f, g, speed) {
			var sky = world.sky;
			new TWEEN.Tween( sky.ctrl )
				.to( {	turbidity: a,
						reileigh: b,
						mieCoefficient: c,
						mieDirectionalG: d,
						luminance: e,
						inclination: f,
						azimuth: g
					 }, speed || 2000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() {
					sky.updateCtrl();
					updateGuiSky();
				})
			.start();
		}

		function animateSunLightIntensity(x) {
			new TWEEN.Tween( sunlight )
				.to( { intensity: x }, 3000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() {
					updateGuiLight();
				})
			.start();
		}

		function animateFrontLightIntensity(x) {
			new TWEEN.Tween( frontLight )
				.to( { intensity: x }, 3000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() {
					
				})
			.start();
		}

		function animateBackLightIntensity(x) {
			new TWEEN.Tween( backLight )
				.to( { intensity: x }, 3000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() {
					
				})
			.start();
		}

		function animateClearSky(speed) {
			animateSky(2, 2.7, 0.008, 0.95, 0.7, 0.7, 0.84, speed);
		}

		function animateSunsetSky(speed) {
			animateSky(20, 4, 0.1, 0.93, 0.35, 0.49, 0.86, speed);
		}

		function animateSilhouetteSky(speed) {
			animateSky(20, 0.9, 0.067, 0.58, 1.17, 0.38, 0.48, speed);
		}

		function animateCityViewSky(speed) {

			// animateSky(15, 2.7, 0.02, 0.75, 0.79, 0.7, 0.84, speed);

			// bright sky
			animateSky(20, 0.1, 0.1, 0, 0.02, 0.72, 0.83, speed);


		}

		function animateWaterNetworkViewSky(speed) {
			animateSky(4, 2, 0.057, 0.49, 0.22, 0.73, 0.94, speed);
		}

		function animateTurbineViewSky(speed) {
			animateSky(40, 1.4, 0.1, 0.64, 0.25, 0.68, 0.58, speed);
		}

		function animateLandfillViewSky(speed) {
			animateSky(18, 1.9, 0.009, 0.74, 0.7, 1, 0.91, speed);
		}

		function animateOceanExposure(e) {
			new TWEEN.Tween( world.ocean )
				.to( { exposure: e}, 1000 )
				.easing( TWEEN.Easing.Quadratic.Out)
					.onUpdate(function() {
						world.ocean.changed = true;
						updateGuiOcean();
					})
			.start();
		}


	// --------- City Views Animation

		function resetView() {

			// clear all active animation
			TWEEN.removeAll();

			animateContentOut();

			animateOceanExposure(0.2);
			animateFrontLightIntensity(0.0);
			animateBackLightIntensity(0.5);

			world.watersupply.animateResetPos();

		}

		function animateCityView() {

			resetView();

			animateCameraTo(new THREE.Vector3(-350.15 , -278.71 , -5.32), 
							new THREE.Vector3(-1830.50 , 2112.81 , -25.24));

			animateFOV(80);
			animateCityViewSky();
			animateSunLightIntensity(1);
			
			currView = 'city';

		}

		function animateTollwayView() {

			resetView();

			animateCameraTo(new THREE.Vector3(-1568.77 , -343.81 , 262.49), 
							new THREE.Vector3(-134.94 , 246.37 , -75.15), 2000);

			animateFOV(110);
			animateSunsetSky(3000);
			animateSunLightIntensity(0, 0, 0);
			animateBackLightIntensity(0.1);
			animateOceanExposure(0.01);

			currView = 'tollway';

		}

		function animateHubView() {

			resetView();

			animateContentIn('#bipv');

			animateCameraTo(new THREE.Vector3(-31.30, 581.13, 372.64), 
							new THREE.Vector3(-462.15, 171.85, -245.54));

			animateFOV(120);
			animateClearSky();
			animateSunLightIntensity(1);

			currView = 'lowAngle';

		}

		function animateTurbinesView() {

			resetView();

			animateCameraTo(new THREE.Vector3( -954.99, 251.94, 957.54 ), 
							new THREE.Vector3( -1894.62, 378.96, 1018.93 ));

			animateFOV(90);
			animateTurbineViewSky(500);
			animateSunLightIntensity(1);
			animateFrontLightIntensity(2.0);
			animateOceanExposure(0.1);

			currView = 'turbines';

		}

		function animateLandfillView() {

			resetView();

			animateCameraTo(new THREE.Vector3(1426.91, -334.68, 267.19), 
							new THREE.Vector3(1035.25, 410.91, -1191.15));

			animateFOV(80);
			animateClearSky();
			animateLandfillViewSky();
			animateSunLightIntensity(1.6);


			currView = 'landfill';

		}

		function animateWaterNetworkView() {

			resetView();

			animateCameraTo(new THREE.Vector3(832.43 , 397.33 , 697.43),
							new THREE.Vector3(21.29 , 694.72 , 666.29));

			animateFOV(80);
			animateWaterNetworkViewSky();
			animateSunLightIntensity(2.0);

			world.watersupply.animateY(700);
			

			currView = 'waterNetwork';

		}

		function animateSilhouetteView() {

			resetView();

			animateCameraTo(new THREE.Vector3(-95.51 , 697.74 , 17.04), 
							new THREE.Vector3(-16988.94 , 308.43 , 1143.06),
							100);

			animateFOV(5);
			animateSilhouetteSky(100);
			animateSunLightIntensity(1);
			animateOceanExposure(0.01);

			currView = 'silhouette';

		}


	// view ctrl GUI

		
		var viewCtrl = {

			silhouette: animateSilhouetteView,
			city: animateCityView,
			turbines: animateTurbinesView,
			landfill: animateLandfillView,
			waterNetwork: animateWaterNetworkView,
			tollway: animateTollwayView,
			hub: animateHubView,
			
		};

		guiViews.add(viewCtrl, 'silhouette');
		guiViews.add(viewCtrl, 'city');
		guiViews.add(viewCtrl, 'turbines');
		guiViews.add(viewCtrl, 'landfill');
		guiViews.add(viewCtrl, 'waterNetwork');
		guiViews.add(viewCtrl, 'tollway');
		guiViews.add(viewCtrl, 'hub');
		



// content bar


	var contentBar = $('.content-container');
	function animateContentOut() {
		contentBar.children().stop().fadeOut({
			queue: false,
			duration: 500
		});
	}

	function animateContentIn(elem) {
		$(elem).stop().fadeIn({
			queue: false,
			duration: 500
		});
	}



// photo SlideShow @param elem w/ img tag inside
	function SlideShow(elem) {

		this._imgArr = $(elem).children();
		this._currIdx = 1;
		this._timeout = null;

		this.duration = 1000;
		this.delay = 1500;
		this.auto = true;

		this.start();

	}

	SlideShow.prototype.start = function() {
		
		var self = this;

		if (this._timeout) {clearTimeout(this._timeout);}
		this._timeout = setTimeout(doFadeStuff, this.delay);

		function doFadeStuff() {
			
			self.fadeOutAll();
			if ( !self._imgArr[self._currIdx] ) { self._currIdx = 0; }
			$(self._imgArr[self._currIdx]).stop().fadeIn({
				duration: self.duration,
				complete: self.auto ? $.proxy(self.start, self) : null
			});
			self._currIdx += 1;
		}

	};

	SlideShow.prototype.fadeOutAll = function() {
		this._imgArr.stop().fadeOut(this.duration);
	};

// sky by zz85
function initSky() {

	// Add Sky Mesh
	var sky = new THREE.Sky();

	// Add Sun Helper
	var sunSphere = new THREE.Mesh( new THREE.SphereGeometry( 20000, 30, 30 ),
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


		sky.mesh.sunPosition = sunSphere.position;



		var lightDist = 10000;
		theta += 0.2; // offset light position to remove shadow map artifact when light is perpendicular with surface normal
		sunlight.position.x = lightDist * Math.cos(phi);
		sunlight.position.y = lightDist * Math.sin(phi) * Math.sin(theta); 
		sunlight.position.z = lightDist * Math.sin(phi) * Math.cos(theta); 

	};

	guiSky = guiDebug.addFolder('Sky');
	guiSky.add( sky.mesh.ctrl, "turbidity", 1.0, 40.0, 0.1 ).onChange( sky.mesh.updateCtrl );
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

function initOcean(oceanGeom) {

	var res = 1024; 
	var origx = 0;
	var origz = 0;
	var ocean = new THREE.Ocean(oceanGeom, renderer, camera, scene, {
		INITIAL_SIZE : 265.0,
		INITIAL_WIND : [15.0, 15.0],
		INITIAL_CHOPPINESS : 3.7,
		CLEAR_COLOR : [1.0, 1.0, 1.0, 0.0],
		GEOMETRY_ORIGIN : [origx, origz],
		SUN_DIRECTION : [-1.0, 1.0, 1.0],
		OCEAN_COLOR: new THREE.Vector3(0.004, 0.016, 0.047),
		SKY_COLOR: new THREE.Vector3(3.2, 9.6, 12.8),
		EXPOSURE : 0.1,
		RESOLUTION : res,
	});
	ocean.materialOcean.uniforms.u_projectionMatrix = { type: "m4", value: camera.projectionMatrix };
	ocean.materialOcean.uniforms.u_viewMatrix = { type: "m4", value: camera.matrixWorldInverse };
	ocean.materialOcean.uniforms.u_cameraPosition = { type: "v3", value: camera.position };


	var lastTime = new Date().getTime();

	ocean.updateOcean = function updateOcean() {

		var currentTime = new Date().getTime();

		ocean.deltaTime = (currentTime - lastTime) * 0.001 || 0.0;

		lastTime = currentTime;
		ocean.render(ocean.deltaTime);
		ocean.overrideMaterial = ocean.materialOcean;
		if (ocean.changed) {
			ocean.materialOcean.uniforms.u_size.value = ocean.size;
			ocean.materialOcean.uniforms.u_sunDirection.value.set( ocean.sunDirectionX, ocean.sunDirectionY, ocean.sunDirectionZ );
			ocean.materialOcean.uniforms.u_exposure.value = ocean.exposure;
			ocean.changed = false;
		}
		ocean.materialOcean.uniforms.u_normalMap.value = ocean.normalMapFramebuffer ;
		ocean.materialOcean.uniforms.u_displacementMap.value = ocean.displacementMapFramebuffer ;
		ocean.materialOcean.uniforms.u_projectionMatrix.value = camera.projectionMatrix ;
		ocean.materialOcean.uniforms.u_viewMatrix.value = camera.matrixWorldInverse ;
		ocean.materialOcean.uniforms.u_cameraPosition.value = camera.position;
		ocean.materialOcean.depthTest = true;

		cameraCtrl.update();

	};


	guiOcean = guiDebug.addFolder('Ocean');
	var c1 = guiOcean.add(ocean, "size", 100, 5000);
	c1.onChange(function(v) {
		this.object.size = v;
		this.object.changed = true;
	});
	var c2 = guiOcean.add(ocean, "choppiness", 0.1, 4);
	c2.onChange(function (v) {
		this.object.choppiness = v;
		this.object.changed = true;
	});
	var c3 = guiOcean.add(ocean, "windX",-15, 15);
	c3.onChange(function (v) {
		this.object.windX = v;
		this.object.changed = true;
	});
	var c4 = guiOcean.add(ocean, "windY", -15, 15);
	c4.onChange(function (v) {
		this.object.windY = v;
		this.object.changed = true;
	});
	var c5 = guiOcean.add(ocean, "sunDirectionX", -1.0, 1.0);
	c5.onChange(function (v) {
		this.object.sunDirectionX = v;
		this.object.changed = true;
	});
	var c6 = guiOcean.add(ocean, "sunDirectionY", -1.0, 1.0);
	c6.onChange(function (v) {
		this.object.sunDirectionY = v;
		this.object.changed = true;
	});
	var c7 = guiOcean.add(ocean, "sunDirectionZ", -1.0, 1.0);
	c7.onChange(function (v) {
		this.object.sunDirectionZ = v;
		this.object.changed = true;
	});
	var c8 = guiOcean.add(ocean, "exposure", 0.0, 0.5);
	c8.onChange(function (v) {
		this.object.exposure = v;
		this.object.changed = true;
	});


	return ocean;

}

function initLensflare() {

	// dirt
	var lensFlare = new THREE.LensFlare( assetManager.getTexture('lensdirtTex'),
										 2048, 0.0, THREE.AdditiveBlending, new THREE.Color( 0x555555 ) );

	// sun
	lensFlare.add( assetManager.getTexture('lensFlare01Tex'), 
				   1024, 0.0, THREE.AdditiveBlending, new THREE.Color( 0xffffff ));

	// hoop
	lensFlare.add( assetManager.getTexture('lensFlareHoopTex'), 
				   512, 1.1, THREE.AdditiveBlending, new THREE.Color( 0xdddddd ));


	lensFlare.position.copy(sunlight.position);
	lensFlare.customUpdateCallback = lensFlareUpdateCallback;

	// scene.add(lensFlare), moved this function now return flare object
	return lensFlare;


	function lensFlareUpdateCallback( object ) {

		var flarePosition = world.sky.sunPosition.clone();

		if (currView === 'tollway') {
			flarePosition.y += 50000;
		}

		object.position.copy( flarePosition );
		// object.position.copy(sunlight.position);

		var vecX = -object.positionScreen.x * 2;
		var vecY = -object.positionScreen.y * 2;

		var f, fl = object.lensFlares.length;
		for( f = 0; f < fl; f++ ) {


			var flare = object.lensFlares[f];
			flare.rotation = 0;

			if ( f > 0 ) {	// no need screen movement for lens dirt
				flare.x = object.positionScreen.x + vecX * flare.distance;
				flare.y = object.positionScreen.y + vecY * flare.distance;
			}
			
			

		}


		// use dot product to find angle to auto rotate flare
			var sunDirection = new THREE.Vector2(object.positionScreen.x, object.positionScreen.y);
			var distToScreenCen = Math.min( sunDirection.length(), 1.0 );

			sunDirection.normalize();
			var upVector = new THREE.Vector2(0, 1);
			var angleToSun = sunDirection.dot(upVector);
			angleToSun = Math.acos( THREE.Math.clamp( angleToSun, - 1, 1 ) );

			if (object.positionScreen.x > 0) {
				angleToSun *= -1;
			}

			object.lensFlares[2].rotation = angleToSun;


		// scale flare according to dist from center 
		// (use ease out cubic beacuse its too small near center), distance must range between [0, 1]
			
			object.lensFlares[2].size = outCubic(distToScreenCen) * 512;

			function outCubic(t) {
				return (--t)*t*t+1;
			}

	}


} // end initLensFlare

	window.addEventListener('keypress', function (event) {
		if (event.keyCode === 32) {	// if spacebar is pressed
			event.preventDefault();
			gui.closed = !gui.closed; // toggle gui

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

		FXAApass.uniforms['resolution'].value.set(1 / (screenWidth * dpr), 1 / (screenHeight * dpr));
  		composer.setSize(screenWidth * dpr, screenHeight * dpr);

	}

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	function onDocumentMouseMove( event ) {
		event.preventDefault();
		mouse.x = ( event.clientX / screenWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / screenHeight ) * 2 + 1;
	}

	// document.addEventListener( 'click', onClick, false);
	// function onClick( event ) {
	// 	event.preventDefault();
	// } 
