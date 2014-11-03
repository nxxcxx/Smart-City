
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
