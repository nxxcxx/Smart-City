
	function startScene() {

		createAndAssignMaterial( 'wastePlant'   , 'wastePlant'   );
		createAndAssignMaterial( 'hubStreetLine', 'hubStreetLine');
		createAndAssignMaterial( 'hubPlatform'  , 'hubPlatform'  );
		createAndAssignMaterial( 'hubBuilding'  , 'hubBuilding'  );

		var m = assetManager.getModel('hubBuilding').material;
		m.envMap = reflectionCube;
		//m.combine = THREE.MultiplyOperation; how envMap combine w/ map
		m.reflectivity = 1.0;

		var platform01 = new THREE.Object3D();
		platform01.add( assetManager.getModel('hubPlatform') );
		platform01.add( assetManager.getModel('hubStreetLine') );
		platform01.add( assetManager.getModel('hubBuilding') );

		var platform02 = new THREE.Object3D();
		platform02.add( assetManager.getModel('wastePlant') );

		scene.add(platform01);
		scene.add(platform02);


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
		window.testCamAnim = function () {

			console.log(cameraCtrl);
			//cameraCtrl.target = new THREE.Vector3(); // set camera look At
			//cameraCtrl.object.position.set(0, 500, 1000);


			var tween = new TWEEN.Tween( cameraCtrl.target ).to( {
						x: 0,
						y: 0,
						z: 0}, 
						1000 )
					.easing( TWEEN.Easing.Quadratic.Out)
					.onUpdate(function() {cameraCtrl.update();}) // important
					.start();

			var tween = new TWEEN.Tween( cameraCtrl.object.position ).to( {
						x: 0,
						y: 500,
						z: 1000}, 
						1000 )
					.easing( TWEEN.Easing.Quadratic.Out)
					.onUpdate(function() {cameraCtrl.update();}) // important
					.start();


			// cameraCtrl.update();

		};

		// draw loop
		(function render(time) {

			requestAnimationFrame(render);
			TWEEN.update(time);
			renderer.setClearColor(scene_settings.bgColor, 1);
			
			// intersectMouse(assetManager.getModel('hubBuilding'));

			renderer.render(scene, camera);
			stats.update();

		})();

	}	// end startScene fn

	function createAndAssignMaterial(modelKey, textureKey) {

		var model = assetManager.getModel(modelKey);
		var texture = assetManager.getTexture(textureKey);

		var newMaterial = new THREE.MeshBasicMaterial({
			map: texture,
		});

		assetManager.addMaterial(modelKey, newMaterial);	// use modelName as materialName
		model.material = newMaterial;

	}