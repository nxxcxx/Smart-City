
	function startScene() {

		setupWorld();

		// set default view
		animateSilhouetteView();
	}


	var debugCTGT = $('.ctgt');
	var debugCPOS = $('.cpos');
	var debugFOV  = $('.fov');

	var debugGL = $('.debug-gl');

	function initDebugInfo() {

		var gl = renderer.context;
		debugGL.html(
			'Version: ' + gl.getParameter(gl.VERSION) + '<br/>' + 
			'Shading language: ' + gl.getParameter(gl.SHADING_LANGUAGE_VERSION) + '<br/>' +
			'Vendor: ' + gl.getParameter(gl.VENDOR) + '<br/>' +
			'Renderer: ' + gl.getParameter(gl.RENDERER) + '<br/>'
		);

	}

	function updateDebugInfo() {
		debugCTGT.html( 'CTGT: ' + cameraCtrl.target.x.toFixed(2) + ', '+ cameraCtrl.target.y.toFixed(2) + ', ' + cameraCtrl.target.z.toFixed(2) );
		debugCPOS.html( 'CPOS: ' + cameraCtrl.object.position.x.toFixed(2) + ', ' + cameraCtrl.object.position.y.toFixed(2) + ', ' + cameraCtrl.object.position.z.toFixed(2) );
		debugFOV.html( 'CFOV: ' + camera.fov.toFixed(2) );
	}

	function render(time) {
		requestAnimationFrame(render);
		stats.update();
		TWEEN.update(time);
		animate(time);

		
		// intersectMouse(world);

		updateDebugInfo();


		// renderer.render(scene, camera);
		composer.render();

	}



	// ------ prototype function


		// --- test ray caster 3D object-mouse intersection todo: check platform's children if contain intersected mesh then do sth

		var prevIntersected = null;

			var raycaster = new THREE.Raycaster();
			function intersectMouse(mesh) {
				
				var mo = new THREE.Vector3( mouse.x, mouse.y, 1 ).unproject( camera );


				raycaster.set( camera.position, mo.sub( camera.position ).normalize() );

				// var intersects = raycaster.intersectObject( mesh , true ); // also check all descendants

				var objArr = _.toArray(mesh);
					objArr = _.without(objArr, world.sky);
				var intersects = raycaster.intersectObjects( objArr , true ); // also check all descendants

				if ( intersects.length > 0 ) {

					// console.log(intersects[0].object.parent.children.length);
					var closestMesh = intersects[0].object;

					var rootModel = getRootModel(closestMesh);
					
					
					intersected = rootModel.name;

					if (prevIntersected === intersected) return;

					// var iMat = getAllMaterials(rootModel);
					// _.forEach(iMat, function (value, key, list) {
					// 	value.wireframe = true;
					// });

					prevIntersected = intersected;	
					// console.log(intersected);


				}
			}

			function getRootModel(object) {
				if ( object.parent && !(object.parent instanceof THREE.Scene) ) {
					return getRootModel(object.parent);
				}
				return object;
			}

			function getAllMaterials(object) {

				var mat = [];

				if (object.material) mat.push(object.material);

				for (var i=0; i<object.children.length; i++) {

					mat = mat.concat( getAllMaterials(object.children[i]) );

				}

				return mat;

			}

