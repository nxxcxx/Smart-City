
// initialize loading manager

	var loadingBar = $('#loadingBar');
	var loadingScreen = $('#loadingScreen');
	var loadingText = $('#loadingText');


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
			loadingText.html(loadedItems + '/' + totalItems + ' ' + item);
		};
		loadingManager.onError = function () {
			console.error('Error: loading assets');
		};
		loadingManager.onLoad = function () {
			console.log(loadedItems + '/' + totalItems + ' assets loaded');
			console.timeEnd('loadingManager');
		
			initContent();	
			startScene();
			initDebugInfo();
			render();


			loadingScreen.css('display', 'none');
			loadingBar.css('display', 'none');
			loadingText.css('display', 'none');
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