
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
