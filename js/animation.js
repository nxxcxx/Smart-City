	/*jshint unused: false */

	var currView = 'city';

	function animate(time) {

		// seaShaderUniforms.time.value = time*0.0005;

		world.shore1.spinTurbines();

		// if (currView === 'waterNetwork') {
		// 	world.watersupply.rotation.y += 0.01;
		// 	if (world.watersupply.rotation.y > Math.PI*2.0) {
		// 		world.watersupply.rotation.y = 0;
		// 	}
		// }


		// if (guiSky && guiCC) {
		// 	for (var i in guiSky.__controllers) {
		// 		guiSky.__controllers[i].updateDisplay();
		// 	}
		// 	for (var i in guiCC.__controllers) {
		// 		guiCC.__controllers[i].updateDisplay();
		// 	}
		// }
		
		
	}

	// Gui auto update

	function updateGuiSky() {
		for (var i in guiSky.__controllers) {
			guiSky.__controllers[i].updateDisplay();
		}
	}

	function updateGuiDirLight() {
		dirLightColor.color = '#' + DirLight.color.getHexString();
		for (var i in guiDebug.__controllers) {
			guiDebug.__controllers[i].updateDisplay();
		}
	}


	// --------- Extend animation methods to Object3D

		THREE.Object3D.prototype.animateResetPos = function () {
			// reset position
			new TWEEN.Tween( this.position ).to( {
				x: this.oripos.x,
				y: this.oripos.y,
				z: this.oripos.z }, 
				1000 )
			.easing( TWEEN.Easing.Quadratic.Out)
			.start();
			// reset rotation
			new TWEEN.Tween( this.rotation ).to( {
				x: this.orirot.x,
				y: this.orirot.y,
				z: this.orirot.z }, 
				1000 )
			.easing( TWEEN.Easing.Quadratic.Out)
			.start();
		};


		THREE.Object3D.prototype.animatePos = function (x, y, z) {
			new TWEEN.Tween( this.position ).to( {
				x: x,
				y: y,
				z: z }, 
				1000 )
			.easing( TWEEN.Easing.Quadratic.Out)
			.start();
		};

		THREE.Object3D.prototype.animateY = function (y) {
			new TWEEN.Tween( this.position ).to( {
				y: y}, 
				1000 )
			.easing( TWEEN.Easing.Quadratic.Out)
			.start();
		};

	// -------- Main animation

		function animateCameraTo(target, position, speed) {

			new TWEEN.Tween( cameraCtrl.target )
				.to( {	x: target.x,
						y: target.y,
						z: target.z
					 }, speed || 1000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() {cameraCtrl.update();})
			.start();

			new TWEEN.Tween( cameraCtrl.object.position )
				.to( {	x: position.x,
						y: position.y,
						z: position.z
					 }, speed || 1000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() {cameraCtrl.update();})
			.start();

		}

		function animateFOV(fov) {
			new TWEEN.Tween( camera )
				.to( {	fov: fov
					 }, 1000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() { camera.updateProjectionMatrix(); })
			.start();
		}

		function setFov(fov) {
			camera.fov = fov;
			camera.updateProjectionMatrix();
		}

		function animateSky(a, b, c, d, e, f, g) {
			var sky = world.sky;
			new TWEEN.Tween( sky.ctrl )
				.to( {	turbidity: a,
						reileigh: b,
						mieCoefficient: c,
						mieDirectionalG: d,
						liminance: e,
						inclination: f,
						azimuth: g
					 }, 5000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() {
					sky.updateCtrl();
					updateGuiSky();
				})
			.start();
		}

		function animateDirLightColor(r, g, b) {
			new TWEEN.Tween( DirLight.color )
				.to( {	r: r, 
						g: g,
						b: b
					 }, 3000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() {
					updateGuiDirLight();
				})
			.start();
		}

		function animateClearSky() {
			animateSky(18.9, 4, 0.063, 0.94, 0.35, 0.86, 0.9);
		}

		function animateSunsetSky() {
			animateSky(20, 4, 0.1, 0.93, 0.11, 0.5, 0.65);
		}


	// --------- City Views Animation

		function resetView() {
			if (currView === 'waterNetwork') {
				world.watersupply.animateResetPos();
			}
		}

		function animateCityView() {

			resetView();

			animateCameraTo(new THREE.Vector3(-350.15 , -278.71 , -5.32), 
							new THREE.Vector3(-1830.50 , 2112.81 , -25.24));

			animateFOV(80);
			animateClearSky();
			animateDirLightColor(1, 1, 1);


			currView = 'city';

		}

		function animateTollwayView() {

			resetView();

			animateCameraTo(new THREE.Vector3(215.35 , 70.55 , 1377.40), 
							new THREE.Vector3(-570.12 , 216.03 , -188.98));

			animateFOV(100);
			animateSunsetSky();
			animateDirLightColor(0, 0, 0);


			currView = 'tollway';

		}

		function animateLowAngleView() {

			resetView();

			animateCameraTo(new THREE.Vector3(-31.30, 581.13, 372.64), 
							new THREE.Vector3(-462.15, 171.85, -245.54));

			animateFOV(120);
			animateClearSky();
			animateDirLightColor(1, 1, 1);

			currView = 'lowAngle';

		}

		function animateTurbinesView() {

			resetView();

			animateCameraTo(new THREE.Vector3(-1005.12 , 91.27 , 865.27), 
							new THREE.Vector3(-1859.96 , 453.77 , 1066.81));

			animateFOV(90);
			animateClearSky();
			animateDirLightColor(1, 1, 1);


			currView = 'turbines';

		}

		function animateLandfillView() {

			resetView();

			animateCameraTo(new THREE.Vector3(1538.19 , -314.89 , 245.60), 
							new THREE.Vector3(989.74 , 481.44 , -1133.21));

			animateFOV(80);
			animateClearSky();
			animateDirLightColor(1, 1, 1);


			currView = 'landfill';

		}

		function animateWaterNetworkView() {

			resetView();

			animateCameraTo(new THREE.Vector3(854.92 , 415.85 , 514.55), 
							new THREE.Vector3(-60.48 , 697.84 , 524.37));

			animateFOV(80);
			animateClearSky();
			animateDirLightColor(1, 1, 1);

			world.watersupply.animateY(700);
			

			currView = 'waterNetwork';

		}

		function animateLowFOV() {

			resetView();

			animateCameraTo(new THREE.Vector3(-46.34 , 671.43 , -89.42), 
							new THREE.Vector3(-15534.92 , 862.24 , 4259.24));

			animateFOV(5);
			animateClearSky();
			animateDirLightColor(1, 1, 1);


			currView = 'lowFOV';

		}


	// view ctrl GUI

		
		var viewCtrl = {
			lowFOV: animateLowFOV,
			city: animateCityView,
			turbines: animateTurbinesView,
			landfill: animateLandfillView,
			waterNetwork: animateWaterNetworkView,
			tollway: animateTollwayView,
			lowAngle: animateLowAngleView
		};

		guiViews.add(viewCtrl, 'lowFOV');
		guiViews.add(viewCtrl, 'city');
		guiViews.add(viewCtrl, 'turbines');
		guiViews.add(viewCtrl, 'landfill');
		guiViews.add(viewCtrl, 'waterNetwork');
		guiViews.add(viewCtrl, 'tollway');
		guiViews.add(viewCtrl, 'lowAngle');
