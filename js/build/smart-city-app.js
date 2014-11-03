
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
		loadingManager.onProgress = function ( item, loaded, total ) {
			console.log( item, loaded, total );
		};
		loadingManager.onError = function () {
			console.error('Error: loading assets');
		};
		loadingManager.onLoad = function () {
			console.log('finished loading');
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

	}

	function createAndAssignMaterial(modelKey, textureKey) {

		var model = assetManager.getModel(modelKey);
		var texture = assetManager.getTexture(textureKey);

		var newMaterial = new THREE.MeshBasicMaterial({
			map: texture,
		});

		assetManager.addMaterial(modelKey, newMaterial);	// use modelName as materialName
		model.material = newMaterial;

		scene.add(model);
	}

	(function run() {

		requestAnimationFrame(run);
		renderer.setClearColor(scene_settings.bgColor, 1);

		// if (par) {
		// 	par.rotation.y += 0.01;
		// }

		renderer.render(scene, camera);
		stats.update();

	})();

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