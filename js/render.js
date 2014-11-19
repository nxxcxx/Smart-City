
	function initContent() {

		new SlideShow('#photo-bipv');
		new SlideShow('#photo-sensor');

	}

	function startScene() {

		setupWorld();

		// set default view
		animateCityView();
		// animateSilhouetteView();

	}
	
	function mapToRange(x, a, b, c, d) {
		return (x-a)/(b-a)*(d-c) + c;
	}

	function render(time) {

		requestAnimationFrame(render);
		TWEEN.update(time);
		animate(time);

		world.beacon.uniforms.time.value = time;

		// intersectMouse(world);

		updateDebugCamera();

		// world to screenPos
			// var sp = world.city01.position.clone();
			// sp.project(camera);
			// // console.log(sp.x, sp.y, sp.z);
			// $('#screen-coords').css({ 
			// 	top:  mapToRange(-sp.y, -1, 1, 0, screenHeight),
			// 	left: mapToRange(sp.x, -1, 1, 0, screenWidth)
			// });


		// render depth to target [ override > render > restore]
			scene.overrideMaterial = depthMaterial;

			world.lensflare.visible = false; // temporaily disable lens flare, it destroys my depth pass
			world.sky.visible = false;
			if (world.ocean) world.ocean.oceanMesh.visible = false; // no depthWrite for ocean
			world.skybox.visible = false;
			world.beacon.visible = false;

			renderer.render(scene, camera, depthTarget, true); // force clear
			// renderer.render(scene, camera);	// show depth pass

			scene.overrideMaterial = null;
			world.lensflare.visible = true;
			world.sky.visible = true;
			if (world.ocean) world.ocean.oceanMesh.visible = true;
			world.skybox.visible = true;
			if (currView === 'sensor') world.beacon.visible = true;

		// render composited passes
		composer.render();

		// renderer.render(scene, camera);


		stats.update();

	}


	// ------ prototype function


		// --- test ray caster 3D object-mouse intersection todo: check platform's children if contain intersected mesh then do sth

		// var prevIntersected = null;

		// 	var raycaster = new THREE.Raycaster();
		// 	function intersectMouse(mesh) {
				
		// 		var mo = new THREE.Vector3( mouse.x, mouse.y, 1 ).unproject( camera );


		// 		raycaster.set( camera.position, mo.sub( camera.position ).normalize() );

		// 		// var intersects = raycaster.intersectObject( mesh , true ); // also check all descendants

		// 		var objArr = _.toArray(mesh);
		// 			objArr = _.without(objArr, world.sky);
		// 		var intersects = raycaster.intersectObjects( objArr , true ); // also check all descendants

		// 		if ( intersects.length > 0 ) {

		// 			// console.log(intersects[0].object.parent.children.length);
		// 			var closestMesh = intersects[0].object;

		// 			var rootModel = getRootModel(closestMesh);
					
					
		// 			intersected = rootModel.name;

		// 			if (prevIntersected === intersected) return;

		// 			// var iMat = getAllMaterials(rootModel);
		// 			// _.forEach(iMat, function (value, key, list) {
		// 			// 	value.wireframe = true;
		// 			// });

		// 			prevIntersected = intersected;	
		// 			// console.log(intersected);


		// 		}
		// 	}

		// 	function getRootModel(object) {
		// 		if ( object.parent && !(object.parent instanceof THREE.Scene) ) {
		// 			return getRootModel(object.parent);
		// 		}
		// 		return object;
		// 	}

		// 	function getAllMaterials(object) {

		// 		var mat = [];

		// 		if (object.material) mat.push(object.material);

		// 		for (var i=0; i<object.children.length; i++) {

		// 			mat = mat.concat( getAllMaterials(object.children[i]) );

		// 		}

		// 		return mat;

		// 	}


