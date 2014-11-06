
	function startScene() {

		// do magic by zz85
			initSky();

		// create base shell for cloning
			var shell = constructModel('shell', {map: 'shellTex'});
			shell.castShadow = false;
			shell.receiveShadow = false;

		// Shore
			var P_Shore = new THREE.Object3D();

			var shorePlatform = constructModel('shorePlatform', {map: 'shorePlatformTex'});
			var shoreWaterSurface = constructModel('shoreWaterSurface', {map:'shoreWaterSurfaceTex' , envMap: 'reflectionCube', opacity: 0.9, transparent: true});
			shorePlatform.castShadow = false;

			P_Shore.add(shorePlatform, shoreWaterSurface);
			
			var P_Shore2 = P_Shore.clone();
			var P_Shore3 = P_Shore.clone();

			P_Shore.position.set(-1402, 0, 811);
			P_Shore2.position.set(-702, 0, 1215);
			P_Shore3.position.set(-1, 0, 1623);

			scene.add(P_Shore, P_Shore2, P_Shore3);

		// Wind turbine
			var allTurbines = new THREE.Object3D();
			var windTurbine = new THREE.Object3D();
			var turBase = constructModel('turbineBase', {map: 'turbineBaseTex'});
			windTurbine.add(turBase);

			var turPro = constructModel('propeller', {});
			turPro.position.set(0, 268, -10);

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
			scene.add(allTurbines);

		// Hub building
			var hub = new THREE.Object3D();
			var hubWindow = constructModel('hubWindow', {map: 'hubWindowTex', envMap: 'reflectionCube', reflectivity: 0.9});
			var hubPlatform = constructModel('hubPlatform', {map: 'hubPlatformTex'});
			var hubStreetLine = constructModel('hubStreetLine', {emissive: 0x0066ff});
			hubStreetLine.castShadow = false;
			hubStreetLine.receiveShadow = false;

			var hubShell = getNewShell();

			hub.add(hubShell, hubPlatform, hubWindow, hubStreetLine);
			scene.add(hub);

		// City 01
			var city01 = new THREE.Object3D();
			var city01Buildings = constructModel('city01', {map: 'city01Tex'});
			var city01Shell = getNewShell();

			city01.position.set(0, 0, -808);
			city01.add(city01Buildings, city01Shell);
			scene.add(city01);

		// Tollway
			var tollway = new THREE.Object3D();
			var tollwayStreet = constructModel('tollway', {map: 'tollwayTex'});
			var tollwayLine = constructModel('tollwayLine', {emissive: 0x0066ff});
			tollwayLine.castShadow = false;
			tollwayLine.receiveShadow = false;
			var tollwayShell = getNewShell();
			tollway.position.set(-702, 0, -403);

			tollway.add(tollwayStreet, tollwayLine, tollwayShell);
			scene.add(tollway);

		// City 02
			var city02 = new THREE.Object3D();
			var city02Buildings = constructModel('city02', {map: 'city02Tex'});
			var city02Shell = getNewShell();

			city02.position.set(700, 0, -405);
			city02.add(city02Buildings, city02Shell);
			scene.add(city02);

		// City 03
			var city03 = new THREE.Object3D();
			var city03Buildings = constructModel('city03', {map: 'city03Tex'});
			var city03Shell = getNewShell();

			city03.position.set(0, 0, 810);
			city03.add(city03Buildings, city03Shell);
			scene.add(city03);

		// Resident 01
			var resident01 = new THREE.Object3D();
			var resident01Buildings = constructModel('resident01', {map: 'resident01Tex'});
			var resident01Shell = getNewShell();

			resident01.position.set(-701, 0, -1213);
			resident01.rotation.y = THREE.Math.degToRad(120);

			resident01.add(resident01Buildings, resident01Shell);
			scene.add(resident01);

		// Resident 02
			var resident02 = new THREE.Object3D();
			var resident02Buildings = constructModel('resident02', {map: 'resident02Tex'});
			var resident02Shell = getNewShell();

			resident02.position.set(-1403, 0, -809);

			resident02.add(resident02Buildings, resident02Shell);

			scene.add(resident02);

		// Resident 03  (02 clone)
			var resident03 = resident02.clone();

			resident03.position.set(-1403, 0, -0);
			resident03.rotation.y = THREE.Math.degToRad(120);

			scene.add(resident03);

		// Resident 04 (01 clone)

			var resident04 = resident01.clone();
			resident04.position.set(-701, 0, 406);
			resident04.rotation.y = THREE.Math.degToRad(0);

			scene.add(resident04);

		// Empty Platform 01
			var ep01 = new THREE.Object3D();
			var ep = constructModel('emptyPlatform', {map: 'emptyPlatformTex'});
			var epshell = getNewShell();
			ep01.add(ep, epshell);
			ep01.position.set(0, 0, -1618);
			scene.add(ep01);

		// Empty Platform 02
			var ep02 = ep01.clone();
			ep02.position.set(700, 0, -1211);
			scene.add(ep02);

		// Empty Platform 03
			var ep03 = ep01.clone();
			ep03.position.set(1398, 0, 0);
			scene.add(ep03);

		// Empty Platform 04
			var ep04 = ep01.clone();
			ep04.position.set(1398, 0, 807);
			scene.add(ep04);

		// Empty Platform 05
			var ep05 = ep01.clone();
			ep05.position.set(700, 0, 1216);
			scene.add(ep05);

		// landfill
			var landfill = new THREE.Object3D();
			var lf = constructModel('landfill', {map: 'landfillTex'});
			var lfshell = getNewShell();
			landfill.add(lf, lfshell);
			landfill.position.set(1403, 0, -805);
			scene.add(landfill);

		// water supply
			var watersupply = new THREE.Object3D();
			var ws = constructModel('watersupply', {map: 'watersupplyTex'});
			var wsshell = getNewShell();
			watersupply.add(ws, wsshell);
			watersupply.position.set(700, 0, 405);
			scene.add(watersupply);



		// ------- Render and Update ** will move out of closure later

			function animate() {
				windTurbine.children[1].rotation.z += 0.05;
				windTurbine2.children[1].rotation.z += 0.05;
				windTurbine3.children[1].rotation.z += 0.05;
			}

			// draw loop
			function render(time) {
				requestAnimationFrame(render);
				TWEEN.update(time);
				animate();
				renderer.setClearColor(scene_settings.bgColor, 1);
				
				// intersectMouse(assetManager.getModel('hubBuilding'));

				// renderer.render(scene, camera);
				composer.render();

				stats.update();
			}

			render();

	}	// end startScene fn




	
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



	// ------ prototype function

		// --- test animation
			// window.testAnimate = function() {

			// 		var tween = new TWEEN.Tween( platform01.position ).to( {
			// 				x: Math.random() * 800 - 400,
			// 				y: Math.random() * 800 - 400,
			// 				z: Math.random() * 800 - 400 }, 
			// 				2000 )
			// 			.easing( TWEEN.Easing.Elastic.Out)
			// 			.start();

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
			// 		if (intersect.object == mesh) {  // r69 now return face3
			// 			console.warn(111);
			// 		}

			// 	}
			// }
		
		// --- test camera animation
			window.testCamAnim = function () {

				//cameraCtrl.target = new THREE.Vector3(); // set camera look At
				//cameraCtrl.object.position.set(0, 500, 1000);

				new TWEEN.Tween( cameraCtrl.target )
					.to( {	x: 0,
							y: 0,
							z: 0}, 
					1000 )
					.easing( TWEEN.Easing.Quadratic.Out)
					.onUpdate(function() {cameraCtrl.update();}) // important
					.start();

				new TWEEN.Tween( cameraCtrl.object.position )
					.to( {	x: -2000,
							y: 1000,
							z: 0}, 
					1000 )
					.easing( TWEEN.Easing.Quadratic.Out)
					.onUpdate(function() {cameraCtrl.update();}) // important
					.start();

			};