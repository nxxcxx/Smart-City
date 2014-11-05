
	function startScene() {

		// do magic by zz85
			initSky();

		// Shore
			var P_Shore = new THREE.Object3D();

			var shorePlatform = constructModel('shorePlatform', {map: 'shorePlatformTex'});
			var shoreWaterSurface = constructModel('shoreWaterSurface', {map:'shoreWaterSurfaceTex' , envMap: 'reflectionCube', opacity: 0.9, transparent: true});

			P_Shore.add(shorePlatform);
			P_Shore.add(shoreWaterSurface);
			
			var P_Shore2 = P_Shore.clone();
			var P_Shore3 = P_Shore.clone();

			P_Shore.position.set(-1402, 0, 811);
			P_Shore2.position.set(-702, 0, 1215);
			P_Shore3.position.set(-1, 0, 1623);

			scene.add(P_Shore);
			scene.add(P_Shore2);
			scene.add(P_Shore3);

		// Wind turbine
			var windTurbine = new THREE.Object3D();
			var turBase = constructModel('turbineBase', {map: 'turbineBaseTex'});
			windTurbine.add(turBase);

			var turPro = constructModel('propeller', {map: 'propellerTex'});
			turPro.position.set(0, 268, -10);

			windTurbine.add(turPro);
			
			var windTurbine2 = windTurbine.clone();
			var windTurbine3 = windTurbine.clone();

			windTurbine.position.set(-1629, 90, 740);
			windTurbine2.position.set(-1454, 90, 842);
			windTurbine3.position.set(-1286, 90, 940);

			windTurbine.rotation.y = THREE.Math.degToRad(110);
			windTurbine2.rotation.y = THREE.Math.degToRad(110);
			windTurbine3.rotation.y = THREE.Math.degToRad(110);

			scene.add(windTurbine);
			scene.add(windTurbine2);
			scene.add(windTurbine3);

		// Hub building
			var hub = new THREE.Object3D();
			var hubWindow = constructModel('hubWindow', {map: 'hubWindowTex', envMap: 'reflectionCube', reflectivity: 0.6});
			var hubPlatform = constructModel('hubPlatform', {map: 'hubPlatformTex'});
			var hubStreetLine = constructModel('hubStreetLine', {color: 0x0077ff});

			hub.add(hubPlatform);
			hub.add(hubWindow);
			hub.add(hubStreetLine);

			scene.add(hub);

		// City 01
			var city01 = constructModel('city01', {map: 'city01Tex'});
			city01.position.set(0, 0, -808);
			scene.add(city01);

		// Tollway
			var tollway = constructModel('tollway', {map: 'tollwayTex'});
			var tollwayLine = constructModel('tollwayLine', {color: 0x0077ff});
			tollway.position.set(-702, 0, -403);
			tollwayLine.position.set(-702, 0, -403);
			scene.add(tollway);
			scene.add(tollwayLine);


		// ------- Render and Update ** will move out of closure later

			function animate() {
				windTurbine.children[1].rotation.z += 0.05;
				windTurbine2.children[1].rotation.z += 0.05;
				windTurbine3.children[1].rotation.z += 0.05;
				// hub.rotation.y+=0.01;
			}

			// draw loop
			function render(time) {
				requestAnimationFrame(render);
				TWEEN.update(time);
				animate();
				renderer.setClearColor(scene_settings.bgColor, 1);
				
				// intersectMouse(assetManager.getModel('hubBuilding'));

				renderer.render(scene, camera);
				// composer.render();

				stats.update();
			}

			render();

	}	// end startScene fn




	
	// ------- Model helper

	function constructModel(modelKey, settings) {

		var model = assetManager.getModel(modelKey);

		var material = new THREE.MeshBasicMaterial({
			shading: THREE.FlatShading
		});

		_.each(settings, function(value, key, list) {
			if (key === 'map' || key === 'envMap') {
				value = assetManager.getTexture(value);
			} else if (key === 'color') {
				value = new THREE.Color(value);
			}
			material[key] = value;
		});

		assetManager.addMaterial(modelKey, material);	// use modelName as materialName
		model.material = material;

		return model;
	}




	// ------ prototype function

		// --- test animation
			window.testAnimate = function() {

					var tween = new TWEEN.Tween( platform01.position ).to( {
							x: Math.random() * 800 - 400,
							y: Math.random() * 800 - 400,
							z: Math.random() * 800 - 400 }, 
							2000 )
						.easing( TWEEN.Easing.Elastic.Out)
						.start();

			};


		// --- test ray caster 3D object-mouse intersection todo: check platform's children if contain intersected mesh then do sth

		// var raycaster = new THREE.Raycaster();
		// function intersectMouse(mesh) {
			
		// 	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 ).unproject( camera );

		// 	raycaster.set( camera.position, vector.sub( camera.position ).normalize() );

		// 	var intersects = raycaster.intersectObject( mesh );

		// 	if ( intersects.length > 0 ) {
		// 		var intersect = intersects[0];
		// 		console.warn(intersects);
		// 		if (intersect.object == mesh) {
		// 			console.warn(111);
		// 		}

		// 	}
		// }
		
		// --- test camera animation
		// window.testCamAnim = function () {

		// 	//cameraCtrl.target = new THREE.Vector3(); // set camera look At
		// 	//cameraCtrl.object.position.set(0, 500, 1000);

		// 	new TWEEN.Tween( cameraCtrl.target ).to( {
		// 		x: 0,
		// 		y: 0,
		// 		z: 0}, 
		// 		1000 )
		// 	.easing( TWEEN.Easing.Quadratic.Out)
		// 	.onUpdate(function() {cameraCtrl.update();}) // important
		// 	.start();

		// 	new TWEEN.Tween( cameraCtrl.object.position ).to( {
		// 		x: 0,
		// 		y: 500,
		// 		z: 1000}, 
		// 		1000 )
		// 	.easing( TWEEN.Easing.Quadratic.Out)
		// 	.onUpdate(function() {cameraCtrl.update();}) // important
		// 	.start();

		// };