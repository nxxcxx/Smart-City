
	function startScene() {

		// Sky bt zz85


			(function initSky(){

				// Add Sky Mesh
				sky = new THREE.Sky();
				scene.add( sky.mesh );

				// Add Sun Helper
				sunSphere = new THREE.Mesh( new THREE.SphereGeometry( 20000, 30, 30 ),
					new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: false }));
				sunSphere.position.y = -700000;
				sunSphere.visible = true;
				scene.add( sunSphere );

				/// GUI
				var effectController  = {
					turbidity: 10,
					reileigh: 2,
					mieCoefficient: 0.005,
					mieDirectionalG: 0.8,
					luminance: 1,
					inclination: 0.49, // elevation / inclination
					azimuth: 0.25, // Facing front,					
					sun: !true
				};

				var distance = 400000;

				function guiChanged() {
					var uniforms = sky.uniforms;
					uniforms.turbidity.value = effectController.turbidity;
					uniforms.reileigh.value = effectController.reileigh;
					uniforms.luminance.value = effectController.luminance;
					uniforms.mieCoefficient.value = effectController.mieCoefficient;
					uniforms.mieDirectionalG.value = effectController.mieDirectionalG;
					var theta = Math.PI * (effectController.inclination - 0.5);
					var phi = 2 * Math.PI * (effectController.azimuth - 0.5);
					sunSphere.position.x = distance * Math.cos(phi);
					sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta); 
					sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta); 
					sunSphere.visible = effectController.sun;
					sky.uniforms.sunPosition.value.copy(sunSphere.position);
				}

				var gui = new dat.GUI();
				var guiSky = gui.addFolder('Sky');
				guiSky.add( effectController, "turbidity", 1.0, 20.0, 0.1 ).onChange( guiChanged );
				guiSky.add( effectController, "reileigh", 0.0, 4, 0.001 ).onChange( guiChanged );
				guiSky.add( effectController, "mieCoefficient", 0.0, 0.1, 0.001 ).onChange( guiChanged );
				guiSky.add( effectController, "mieDirectionalG", 0.0, 1, 0.001 ).onChange( guiChanged );
				guiSky.add( effectController, "luminance", 0.0, 2).onChange( guiChanged );;
				guiSky.add( effectController, "inclination", 0, 1, 0.0001).onChange( guiChanged );
				guiSky.add( effectController, "azimuth", 0, 1, 0.0001).onChange( guiChanged );
				guiSky.add( effectController, "sun").onChange( guiChanged );
				guiChanged();

			})();




		// shore
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

		// wind turbine
		var windTurbine = new THREE.Object3D();
		var turBase = constructModel('turbineBase', {map: 'turbineBaseTex'});
		windTurbine.add(turBase);

		var turPro = constructModel('propeller', {map: 'propellerTex'});
		turPro.position.set(0, 268, -10);
		windTurbine.add(turPro);
		windTurbine.position.set(-1629, 90, 740);
		windTurbine.rotation.y = THREE.Math.degToRad(110);

		scene.add(windTurbine);


		function animate() {
			turPro.rotation.z += 0.05;
		}

		// draw loop
		(function render(time) {

			requestAnimationFrame(render);
			TWEEN.update(time);
			animate();
			renderer.setClearColor(scene_settings.bgColor, 1);
			
			// intersectMouse(assetManager.getModel('hubBuilding'));

			renderer.render(scene, camera);
			// composer.render();

			stats.update();

		})();

	}	// end startScene fn

	function constructModel(modelKey, settings) {

		var model = assetManager.getModel(modelKey);

		var material = new THREE.MeshBasicMaterial({
			shading: THREE.FlatShading
		});

		_.each(settings, function(value, key, list) {
			if (key === 'map' || key === 'envMap') {
				value = assetManager.getTexture(value);
			}
			material[key] = value;
		});

		assetManager.addMaterial(modelKey, material);	// use modelName as materialName
		model.material = material;

		return model;
	}




	// ------ prototype

		// --- test animation
			// window.testAnimate = function() {

				// 	var tween = new TWEEN.Tween( platform01.position ).to( {
				// 			x: Math.random() * 800 - 400,
				// 			y: Math.random() * 800 - 400,
				// 			z: Math.random() * 800 - 400 }, 
				// 			2000 )
				// 		.easing( TWEEN.Easing.Elastic.Out)
				// 		.start();

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