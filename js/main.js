

	var world = {};

	THREE.Object3D.prototype.setDefaultPos = function(x, y, z, rx, ry, rz) {
		this.position.set(x, y, z);
		this.oripos = this.position.clone();
		this.orirot = this.rotation.clone();
		if (rx && ry && rz) {
			this.rotation.set(rx, ry, rz);
			this.orirot = this.rotation.clone();
		}
	};


	function startScene() {

		
		// Experimental stuff
			// // test shader 

				// var seaShaderUniforms = {
				// 	time: { type: "f", value: 1.0 },
				// 	resolution: { type: "v2", value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
				// };

				// var seaShaderMat = new THREE.ShaderMaterial( {

				// 	uniforms: seaShaderUniforms,
				// 	vertexShader: document.getElementById( 'vertexShader' ).textContent,
				// 	fragmentShader: document.getElementById( 'fragmentShader' ).textContent,

				// } );

				// var shaderMesh = new THREE.Mesh( new THREE.BoxGeometry(2000, 10, 2000), seaShaderMat );
				// shaderMesh.position.y = 2000;
				// scene.add( shaderMesh );



		// private stuff
		(function init() {

			// create base shell for cloning
			var shell = constructModel('shell', {map: 'shellTex'});
			shell.castShadow = false;
			shell.receiveShadow = false;

		})();

		// ------- Model helper

		function constructModel(modelKey, settings) {

			var model = assetManager.getModel(modelKey);

			var material = new THREE.MeshLambertMaterial({
				shading: THREE.FlatShading
			});

			_.each(settings, function(value, key, list) {

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
		


		// world stuff

		world.sky = initSky(); // do magic by zz85

		world.shore1 = (function () {

			var shore = new THREE.Object3D();
			var shorePlatform = constructModel('shorePlatform', {color: 0xddddee});
			var shoreWaterSurface = constructModel('shoreWaterSurface', {map:'shoreWaterSurfaceTex' , envMap: 'reflectionCube', opacity: 0.9, transparent: true});
			shorePlatform.castShadow = false;

			// overridw w/ shader
			// shoreWaterSurface.material = seaShaderMat;

			shore.add(shorePlatform, shoreWaterSurface);
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
		
		world.turbines = (function () {

			var allTurbines = new THREE.Object3D();
			var windTurbine = new THREE.Object3D();
			var turBase = constructModel('turbineBase', {color: 0xddddee});
			var turPro = constructModel('propeller', {color: 0xddddee});


			turPro.position.set(0, 268, -10);

			windTurbine.add(turBase);
			windTurbine.add(turPro);
			
			var windTurbine2 = windTurbine.clone();
			var windTurbine3 = windTurbine.clone();

			windTurbine.position.set(-1629, 90, 740);
			windTurbine2.position.set(-1454, 90, 842);
			windTurbine3.position.set(-1286, 90, 940);

			windTurbine.rotation.y = 
			windTurbine2.rotation.y = 
			windTurbine3.rotation.y = THREE.Math.degToRad(110);

			allTurbines.add(windTurbine, windTurbine2, windTurbine3);

			allTurbines.spin = function () {
				windTurbine.children[1].rotation.z += 0.05;
				windTurbine2.children[1].rotation.z += 0.05;
				windTurbine3.children[1].rotation.z += 0.05;
			};

			return allTurbines;

		})();
			
		world.hub = (function () {

			var hub = new THREE.Object3D();
			var hubWindow = constructModel('hubWindow', {map: 'hubWindowTex', envMap: 'reflectionCube', reflectivity: 0.9});
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
			var lf = constructModel('landfill', {color: 0xddddee});
			var lfshell = getNewShell();
			landfill.add(lf, lfshell);
			landfill.setDefaultPos(1400, 0, -805);
			return landfill;

		})();

		world.watersupply = (function () {

			var watersupply = new THREE.Object3D();
			var ws = constructModel('watersupply', {color: 0xddddee});
			var wsshell = getNewShell();
			watersupply.add(ws, wsshell);
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
			var ep = constructModel('emptyPlatform', {color: 0xddddee});
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

		// --- add all to scene
		_.each(world, function (object) {
			scene.add(object);
		});

		// set default view
		animateCityView();

	}	// end startScene fn


	// draw loop
	function render(time) {
		requestAnimationFrame(render);
		TWEEN.update(time);
		animate(time);
		renderer.setClearColor(scene_settings.bgColor, 1);
		
		// intersectMouse(assetManager.getModel('hubBuilding'));

		// renderer.render(scene, camera);
		composer.render();

		stats.update();
	}



	// ------ prototype function


		// --- test ray caster 3D object-mouse intersection todo: check platform's children if contain intersected mesh then do sth

			// var raycaster = new THREE.Raycaster();
			// function intersectMouse(mesh) {
				
			// 	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 ).unproject( camera );

			// 	raycaster.set( camera.position, vector.sub( camera.position ).normalize() );

			// 	var intersects = raycaster.intersectObject( mesh );

			// 	if ( intersects.length > 0 ) {
			// 		var intersect = intersects[0];
			// 		console.warn(intersects);
			// 		if (intersect.object == mesh) {  // r69 now return face3
			// 			console.warn(111);
			// 		}

			// 	}
			// }
		





