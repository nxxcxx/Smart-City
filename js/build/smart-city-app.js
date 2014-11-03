
	var container, stats;
	var scene, light, camera, cameraCtrl, renderer;
	var mouse = new THREE.Vector2();


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
			addMaterial: addMaterial
		};

	})();

	assetManager
		.addFile('wastePlant', 'p01.png')
		.addFile('wastePlant', 'p01.obj')

		.addFile('hubStreetLine', 'p05-street-line.png')
		.addFile('hubStreetLine', 'p05-street-line.obj')

		.addFile('hubPlatform', 'p05-static.png')
		.addFile('hubPlatform', 'p05-static.obj')

		.addFile('hubBuilding', 'p05-hub.png')
		.addFile('hubBuilding', 'p05-hub.obj')

		

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
		});
	});


	// Environment texture
	var path = "assets/skybox/";
	var format = '.jpg';
	var urls = [
			path + 'px' + format, path + 'nx' + format,
			path + 'py' + format, path + 'ny' + format,
			path + 'pz' + format, path + 'nz' + format
		];

	var reflectionCube = THREE.ImageUtils.loadTextureCube(urls);
	reflectionCube.format = THREE.RGBFormat;

	function startScene() {

		createAndAssignMaterial( 'wastePlant'   , 'wastePlant'   );
		createAndAssignMaterial( 'hubStreetLine', 'hubStreetLine');
		createAndAssignMaterial( 'hubPlatform'  , 'hubPlatform'  );
		createAndAssignMaterial( 'hubBuilding'  , 'hubBuilding'  );

		var m = assetManager.getModel('hubBuilding').material;
		m.envMap = reflectionCube;
		//m.combine = THREE.MultiplyOperation; how envMap combine w/ map
		m.reflectivity = 1.0;

		var platform01 = new THREE.Object3D();
		platform01.add( assetManager.getModel('hubPlatform') );
		platform01.add( assetManager.getModel('hubStreetLine') );
		platform01.add( assetManager.getModel('hubBuilding') );

		var platform02 = new THREE.Object3D();
		platform02.add( assetManager.getModel('wastePlant') );

		scene.add(platform01);
		scene.add(platform02);


		// --- test animation
		// window.testAnimate = function() {

			// 	var tween = new TWEEN.Tween( platform01.position ).to( {
			// 			x: Math.random() * 800 - 400,
			// 			y: Math.random() * 800 - 400,
			// 			z: Math.random() * 800 - 400 }, 
			// 			2000 )
			// 		.easing( TWEEN.Easing.Elastic.Out)
			// 		.start();

		// };


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
		window.testCamAnim = function () {

			console.log(cameraCtrl);
			//cameraCtrl.target = new THREE.Vector3(); // set camera look At
			//cameraCtrl.object.position.set(0, 500, 1000);


			var tween = new TWEEN.Tween( cameraCtrl.target ).to( {
						x: 0,
						y: 0,
						z: 0}, 
						1000 )
					.easing( TWEEN.Easing.Quadratic.Out)
					.onUpdate(function() {cameraCtrl.update();}) // important
					.start();

			var tween = new TWEEN.Tween( cameraCtrl.object.position ).to( {
						x: 0,
						y: 500,
						z: 1000}, 
						1000 )
					.easing( TWEEN.Easing.Quadratic.Out)
					.onUpdate(function() {cameraCtrl.update();}) // important
					.start();


			// cameraCtrl.update();

		};

		// draw loop
		(function render(time) {

			requestAnimationFrame(render);
			TWEEN.update(time);
			renderer.setClearColor(scene_settings.bgColor, 1);
			
			// intersectMouse(assetManager.getModel('hubBuilding'));

			renderer.render(scene, camera);
			stats.update();

		})();

	}	// end startScene fn

	function createAndAssignMaterial(modelKey, textureKey) {

		var model = assetManager.getModel(modelKey);
		var texture = assetManager.getTexture(textureKey);

		var newMaterial = new THREE.MeshBasicMaterial({
			map: texture,
		});

		assetManager.addMaterial(modelKey, newMaterial);	// use modelName as materialName
		model.material = newMaterial;

	}

	

	// browser events
	// window.addEventListener('keypress', function (event) {
	// 	if (event.keyCode === 32) {	// if spacebar is pressed
	// 		event.preventDefault();
	// 	}
	// });

	window.addEventListener('resize', onWindowResize, false);
	function onWindowResize() {
		var w = window.innerWidth;
		var h = window.innerHeight;
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		renderer.setSize(w, h);
	}



	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	function onDocumentMouseMove( event ) {
		event.preventDefault();
		mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	}
