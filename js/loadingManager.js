
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