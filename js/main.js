
	function startScene() {
		setupWorld();
		// set default view
		animateCityView();
	}

	function render(time) {
		requestAnimationFrame(render);
		stats.update();
		TWEEN.update(time);
		animate(time);
		
		// intersectMouse(world.hub);

		// renderer.render(scene, camera);
		composer.render();

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
		





