
function setupWorld() {

	// ------- Model helper

		constructModel('emptyPlatform', {color: 0xddddee});
		var shell = constructModel('shell', {color: 0xddddee});
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


		// *****************	test ocean

		var oceanGeom = assetManager.getModel('oceanSurface').geometry;
		world.ocean = initOcean(oceanGeom);
		world.ocean.setRotationY( - Math.PI/6.0 );
		world.ocean.setPosition(-760.47, 97.23, 1322.69);
		scene.add(world.ocean.oceanMesh);




		world.shore1 = (function () {

			var shore = new THREE.Object3D();
			var shorePlatform = constructModel('shorePlatform', {color: 0xddddee});
			// var shoreWaterSurface = constructModel('shoreWaterSurface', {map:'shoreWaterSurfaceTex' , envMap: 'reflectionCube', opacity: 0.7, transparent: true});
			shorePlatform.castShadow = false;

			// shore.add(shorePlatform, shoreWaterSurface);

			shore.add(shorePlatform);
			shore.setDefaultPos(-1400, 0, 805);

			return shore;

		})();

		world.shore2 = (function () {

			var shore = world.shore1.clone();
			shore.setDefaultPos(-700, 0, 1215);
			return shore;

		})();

		world.shore3 = (function () {

			var shore = world.shore1.clone();
			shore.setDefaultPos(0, 0, 1623);
			return shore;

		})();
		
		// add turbines to shore1
			var allTurbines = new THREE.Object3D();
			var windTurbine = new THREE.Object3D();
			var turBase = constructModel('turbineBase', {color: 0xddddee});
			var turPro = constructModel('propeller', {color: 0xddddee});
			turPro.position.set(0, 268, -10);

			windTurbine.add(turBase);
			windTurbine.add(turPro);
			
			var windTurbine2 = windTurbine.clone();
			var windTurbine3 = windTurbine.clone();

			// relative postiton
			windTurbine.position.set(-223, 90, -75);
			windTurbine2.position.set(-22, 90, 40);
			windTurbine3.position.set(175, 90, 153);

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
			var hubPlatform = constructModel('hubPlatform', {color: 0xddddee});
			var hubStreetLine = constructModel('hubStreetLine', {emissive: 0x0066ff});
			hubStreetLine.castShadow = false;
			hubStreetLine.receiveShadow = false;
			var hubShell = getNewShell();
			hub.add(hubShell, hubPlatform, hubWindow, hubStreetLine);
			hub.setDefaultPos(0, 0, 0);
			return hub;

		})();

		world.city01 = (function () {

			var city01 = new THREE.Object3D();
			var city01Buildings = constructModel('city01', {color: 0xddddee});
			var city01Shell = getNewShell();
			city01.setDefaultPos(0, 0, -808);
			city01.add(city01Buildings, city01Shell);
			return city01;

		})();

		world.city02 = (function () {

			var city02 = new THREE.Object3D();
			var city02Buildings = constructModel('city02', {color: 0xddddee});
			var city02Shell = getNewShell();
			city02.setDefaultPos(700, 0, -405);
			city02.add(city02Buildings, city02Shell);
			return city02;

		})();

		world.city03 = (function () {

			var city03 = new THREE.Object3D();
			var city03Buildings = constructModel('city03', {color: 0xddddee});
			var city03Shell = getNewShell();
			city03.setDefaultPos(0, 0, 810);
			city03.add(city03Buildings, city03Shell);
			return city03;

		})();
		
		world.tollway = (function () {

			var tollway = new THREE.Object3D();
			var tollwayStreet = constructModel('tollway', {color: 0xddddee});
			var tollwayLine = constructModel('tollwayLine', {emissive: 0x0066ff});
			tollwayLine.castShadow = false;
			tollwayLine.receiveShadow = false;
			var tollwayShell = getNewShell();
			tollway.setDefaultPos(-702, 0, -403);
			tollway.add(tollwayStreet, tollwayLine, tollwayShell);
			return tollway;

		})();
			
		world.landfill = (function () {

			var landfill = new THREE.Object3D();
			var lfbuilding = constructModel('landfill', {map: 'landfillTex'});
			var lfpipe = constructModel('landfillWindow', {map: 'landfillWindowTex', envMap: 'reflectionCube'});
			var lfwindow = constructModel('landfillPipe', {map: 'landfillPipeTex', envMap: 'reflectionCube', reflectivity: 0.4});
			lfbuilding.position.x = lfpipe.position.x = lfwindow.position.x = -30;
			var ep = getNewPlatform(); 
			var lfshell = getNewShell();
			landfill.add(lfbuilding, lfpipe, lfwindow, ep, lfshell);
			landfill.setDefaultPos(1400, 0, -805);
			return landfill;

		})();

		world.watersupply = (function () {

			var watersupply = new THREE.Object3D();
			var ws = constructModel('watersupply', {color: 0xddddee});
			var wp = constructModel('watersupplyPipe', {map: 'watersupplyPipeTex', envMap: 'reflectionCube', reflectivity: 0.6});
			var shell = getNewShell();
			watersupply.add(ws, wp, shell);
			watersupply.setDefaultPos(700, 0, 405);
			return watersupply;

		})();

		world.resident1 = (function () {

			var resident01 = new THREE.Object3D();
			var resident01Buildings = constructModel('resident01', {color: 0xddddee});
			var resident01Shell = getNewShell();
			resident01.setDefaultPos(-700, 0, -1213);
			resident01.rotation.y = THREE.Math.degToRad(120);
			resident01.add(resident01Buildings, resident01Shell);
			return resident01;

		})();

		world.resident2 = (function () {

			var resident02 = new THREE.Object3D();
			var resident02Buildings = constructModel('resident02', {color: 0xddddee});
			var resident02Shell = getNewShell();
			resident02.setDefaultPos(-1400, 0, -809);
			resident02.add(resident02Buildings, resident02Shell);
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