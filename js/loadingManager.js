
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