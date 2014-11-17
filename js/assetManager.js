
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

		.addFile('landfillDirtTex', 'landfill/dirt.png')
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


