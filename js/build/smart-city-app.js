
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
		// z-near too low will cause artifact when viewing from far distance
		camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 10.0, 2000000);
		// -- camera orbit control
		cameraCtrl = new THREE.OrbitControls(camera, container);
		cameraCtrl.object.position.set(-5000, 2000, 0);
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

		
		// composer.addPass( renderPass );
		// composer.addPass( copyPass );
		// composer.addPass( SSAOpass );
		// composer.addPass( copyPass );
		// composer.addPass( FXAApass );


	var assetManager = (function () {

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





	;


// initialize loaders
	var loadingManager = new THREE.LoadingManager();
		console.time('loadingManager');
		loadingManager.onProgress = function ( item, loaded, total ) {
			console.log( item, loaded, total );
		};
		loadingManager.onError = function () {
			console.error('Error: loading assets');
		};
		loadingManager.onLoad = function () {
			console.log('finished loading');
			console.timeEnd('loadingManager');
			startScene();
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
			asset.model.receiveShadow = true;
			asset.model.castShadow = true;
		});
	});


	// Environment texture
	var path = "assets/skybox/";
	var format = '.bmp';
	var urls = [
			path + 'px' + format, path + 'nx' + format,
			path + 'py' + format, path + 'ny' + format,
			path + 'pz' + format, path + 'nz' + format
		];

	var reflectionCube = THREE.ImageUtils.loadTextureCube(urls);
	reflectionCube.format = THREE.RGBFormat;

	assetManager.addTexture('reflectionCube', reflectionCube);

	function startScene() {

		// do magic by zz85
			initSky();

		// Shore
			var P_Shore = new THREE.Object3D();

			var shorePlatform = constructModel('shorePlatform', {map: 'shorePlatformTex'});
			var shoreWaterSurface = constructModel('shoreWaterSurface', {map:'shoreWaterSurfaceTex' , envMap: 'reflectionCube', opacity: 0.9, transparent: true});

			P_Shore.add(shorePlatform);
			P_Shore.add(shoreWaterSurface);
			
			var P_Shore2 = P_Shore.clone();
			var P_Shore3 = P_Shore.clone();

			P_Shore.position.set(-1402, 0, 811);
			P_Shore2.position.set(-702, 0, 1215);
			P_Shore3.position.set(-1, 0, 1623);

			scene.add(P_Shore);
			scene.add(P_Shore2);
			scene.add(P_Shore3);

		// Wind turbine
			var windTurbine = new THREE.Object3D();
			var turBase = constructModel('turbineBase', {map: 'turbineBaseTex'});
			windTurbine.add(turBase);

			var turPro = constructModel('propeller', {map: 'propellerTex'});
			turPro.position.set(0, 268, -10);

			windTurbine.add(turPro);
			
			var windTurbine2 = windTurbine.clone();
			var windTurbine3 = windTurbine.clone();

			windTurbine.position.set(-1629, 90, 740);
			windTurbine2.position.set(-1454, 90, 842);
			windTurbine3.position.set(-1286, 90, 940);

			windTurbine.rotation.y = THREE.Math.degToRad(110);
			windTurbine2.rotation.y = THREE.Math.degToRad(110);
			windTurbine3.rotation.y = THREE.Math.degToRad(110);

			scene.add(windTurbine);
			scene.add(windTurbine2);
			scene.add(windTurbine3);

		// Hub building
			var hub = new THREE.Object3D();
			var hubWindow = constructModel('hubWindow', {map: 'hubWindowTex', envMap: 'reflectionCube', reflectivity: 0.6});
			var hubPlatform = constructModel('hubPlatform', {map: 'hubPlatformTex'});
			var hubStreetLine = constructModel('hubStreetLine', {color: 0x0077ff});

			hub.add(hubPlatform);
			hub.add(hubWindow);
			hub.add(hubStreetLine);

			scene.add(hub);

		// City 01
			var city01 = constructModel('city01', {map: 'city01Tex'});
			city01.position.set(0, 0, -808);
			scene.add(city01);

		// Tollway
			var tollway = constructModel('tollway', {map: 'tollwayTex'});
			var tollwayLine = constructModel('tollwayLine', {color: 0x0077ff});
			tollway.position.set(-702, 0, -403);
			tollwayLine.position.set(-702, 0, -403);
			scene.add(tollway);
			scene.add(tollwayLine);


		// ------- Render and Update ** will move out of closure later

			function animate() {
				windTurbine.children[1].rotation.z += 0.05;
				windTurbine2.children[1].rotation.z += 0.05;
				windTurbine3.children[1].rotation.z += 0.05;
				// hub.rotation.y+=0.01;
			}

			// draw loop
			function render(time) {
				requestAnimationFrame(render);
				TWEEN.update(time);
				animate();
				renderer.setClearColor(scene_settings.bgColor, 1);
				
				// intersectMouse(assetManager.getModel('hubBuilding'));

				renderer.render(scene, camera);
				// composer.render();

				stats.update();
			}

			render();

	}	// end startScene fn




	
	// ------- Model helper

	function constructModel(modelKey, settings) {

		var model = assetManager.getModel(modelKey);

		var material = new THREE.MeshBasicMaterial({
			shading: THREE.FlatShading
		});

		_.each(settings, function(value, key, list) {
			if (key === 'map' || key === 'envMap') {
				value = assetManager.getTexture(value);
			} else if (key === 'color') {
				value = new THREE.Color(value);
			}
			material[key] = value;
		});

		assetManager.addMaterial(modelKey, material);	// use modelName as materialName
		model.material = material;

		return model;
	}




	// ------ prototype function

		// --- test animation
			window.testAnimate = function() {

					var tween = new TWEEN.Tween( platform01.position ).to( {
							x: Math.random() * 800 - 400,
							y: Math.random() * 800 - 400,
							z: Math.random() * 800 - 400 }, 
							2000 )
						.easing( TWEEN.Easing.Elastic.Out)
						.start();

			};


		// --- test ray caster 3D object-mouse intersection todo: check platform's children if contain intersected mesh then do sth

		// var raycaster = new THREE.Raycaster();
		// function intersectMouse(mesh) {
			
		// 	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 ).unproject( camera );

		// 	raycaster.set( camera.position, vector.sub( camera.position ).normalize() );

		// 	var intersects = raycaster.intersectObject( mesh );

		// 	if ( intersects.length > 0 ) {
		// 		var intersect = intersects[0];
		// 		console.warn(intersects);
		// 		if (intersect.object == mesh) {
		// 			console.warn(111);
		// 		}

		// 	}
		// }
		
		// --- test camera animation
		// window.testCamAnim = function () {

		// 	//cameraCtrl.target = new THREE.Vector3(); // set camera look At
		// 	//cameraCtrl.object.position.set(0, 500, 1000);

		// 	new TWEEN.Tween( cameraCtrl.target ).to( {
		// 		x: 0,
		// 		y: 0,
		// 		z: 0}, 
		// 		1000 )
		// 	.easing( TWEEN.Easing.Quadratic.Out)
		// 	.onUpdate(function() {cameraCtrl.update();}) // important
		// 	.start();

		// 	new TWEEN.Tween( cameraCtrl.object.position ).to( {
		// 		x: 0,
		// 		y: 500,
		// 		z: 1000}, 
		// 		1000 )
		// 	.easing( TWEEN.Easing.Quadratic.Out)
		// 	.onUpdate(function() {cameraCtrl.update();}) // important
		// 	.start();

		// };

	

	// browser events
	// window.addEventListener('keypress', function (event) {
	// 	if (event.keyCode === 32) {	// if spacebar is pressed
	// 		event.preventDefault();
	// 	}
	// });

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
	// 	console.log(cameraCtrl.object.position);
	// } 
// sky by zz85
function initSky(){

	// Add Sky Mesh
	sky = new THREE.Sky();
	scene.add( sky.mesh );

	// Add Sun Helper
	sunSphere = new THREE.Mesh( new THREE.SphereGeometry( 20000, 30, 30 ),
		new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: false }));
	sunSphere.position.y = -700000;
	sunSphere.visible = true;
	scene.add( sunSphere );

	/// GUI
	var effectController  = {
		turbidity: 10,
		reileigh: 2,
		mieCoefficient: 0.005,
		mieDirectionalG: 0.8,
		luminance: 1,
		inclination: 0.49, // elevation / inclination
		azimuth: 0.5, // Facing front,					
		sun: !true
	};

	var distance = 400000;

	function guiChanged() {
		var uniforms = sky.uniforms;
		uniforms.turbidity.value = effectController.turbidity;
		uniforms.reileigh.value = effectController.reileigh;
		uniforms.luminance.value = effectController.luminance;
		uniforms.mieCoefficient.value = effectController.mieCoefficient;
		uniforms.mieDirectionalG.value = effectController.mieDirectionalG;
		var theta = Math.PI * (effectController.inclination - 0.5);
		var phi = 2 * Math.PI * (effectController.azimuth - 0.5);
		sunSphere.position.x = distance * Math.cos(phi);
		sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta); 
		sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta); 
		sunSphere.visible = effectController.sun;
		sky.uniforms.sunPosition.value.copy(sunSphere.position);
	}

	var gui = new dat.GUI();
	var guiSky = gui.addFolder('Sky');
	guiSky.add( effectController, "turbidity", 1.0, 20.0, 0.1 ).onChange( guiChanged );
	guiSky.add( effectController, "reileigh", 0.0, 4, 0.001 ).onChange( guiChanged );
	guiSky.add( effectController, "mieCoefficient", 0.0, 0.1, 0.001 ).onChange( guiChanged );
	guiSky.add( effectController, "mieDirectionalG", 0.0, 1, 0.001 ).onChange( guiChanged );
	guiSky.add( effectController, "luminance", 0.0, 2).onChange( guiChanged );;
	guiSky.add( effectController, "inclination", 0, 1, 0.0001).onChange( guiChanged );
	guiSky.add( effectController, "azimuth", 0, 1, 0.0001).onChange( guiChanged );
	guiSky.add( effectController, "sun").onChange( guiChanged );
	guiChanged();

}