	/*jshint unused: false */

	var currView = 'city';

	function animate(time) {

		// seaShaderUniforms.time.value = time*0.0005;

		world.shore1.spinTurbines();

		world.ocean.updateOcean();

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

	function updateGuiLight() {
		sunLightColor.color = '#' + sunLight.color.getHexString();
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

		function animateSky(a, b, c, d, e, f, g, speed) {
			var sky = world.sky;
			new TWEEN.Tween( sky.ctrl )
				.to( {	turbidity: a,
						reileigh: b,
						mieCoefficient: c,
						mieDirectionalG: d,
						luminance: e,
						inclination: f,
						azimuth: g
					 }, speed || 2000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() {
					sky.updateCtrl();
					updateGuiSky();
				})
			.start();
		}

		function animateSunLightIntensity(x) {
			new TWEEN.Tween( sunLight )
				.to( { intensity: x }, 3000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() {
					updateGuiLight();
				})
			.start();
		}

		function animateClearSky(speed) {
			animateSky(2, 2.7, 0.008, 0.95, 0.7, 0.7, 0.84, speed);
		}

		function animateSunsetSky(speed) {
			animateSky(20, 4, 0.1, 0.93, 0.35, 0.49, 0.86, speed);
		}

		function animateSilhouetteSky(speed) {
			animateSky(20, 0.9, 0.067, 0.58, 1.17, 0.38, 0.48, speed);
		}

		function animateCityViewSky(speed) {
			animateSky(15, 2.7, 0.02, 0.75, 0.79, 0.7, 0.84, speed);
		}

		function animateWaterNetworkViewSky(speed) {
			animateSky(4, 2, 0.057, 0.49, 0.22, 0.73, 0.94, speed);
		}


	// --------- City Views Animation

		function resetView() {

			// clear all active animation
			TWEEN.removeAll();

			if (currView === 'waterNetwork') {
				world.watersupply.animateResetPos();
			}
		}

		function animateCityView() {

			resetView();

			animateCameraTo(new THREE.Vector3(-350.15 , -278.71 , -5.32), 
							new THREE.Vector3(-1830.50 , 2112.81 , -25.24));

			animateFOV(80);
			animateCityViewSky();
			animateSunLightIntensity(1);


			currView = 'city';

		}

		function animateTollwayView() {

			resetView();

			animateCameraTo(new THREE.Vector3(-1568.77 , -343.81 , 262.49), 
							new THREE.Vector3(-134.94 , 246.37 , -75.15), 2000);

			animateFOV(110);
			animateSunsetSky(3000);
			animateSunLightIntensity(0, 0, 0);

			currView = 'tollway';

		}

		function animateLowAngleView() {

			resetView();

			animateCameraTo(new THREE.Vector3(-31.30, 581.13, 372.64), 
							new THREE.Vector3(-462.15, 171.85, -245.54));

			animateFOV(120);
			animateClearSky();
			animateSunLightIntensity(1);

			currView = 'lowAngle';

		}

		function animateTurbinesView() {

			resetView();

			animateCameraTo(new THREE.Vector3(-1005.12 , 91.27 , 865.27), 
							new THREE.Vector3(-1859.96 , 453.77 , 1066.81));

			animateFOV(90);
			animateClearSky();
			animateSunLightIntensity(1);


			currView = 'turbines';

		}

		function animateLandfillView() {

			resetView();

			animateCameraTo(new THREE.Vector3(1538.19 , -314.89 , 245.60), 
							new THREE.Vector3(989.74 , 481.44 , -1133.21));

			animateFOV(80);
			animateClearSky();
			animateSunLightIntensity(1);


			currView = 'landfill';

		}

		function animateWaterNetworkView() {

			resetView();

			animateCameraTo(new THREE.Vector3(832.43 , 397.33 , 697.43),
							new THREE.Vector3(21.29 , 694.72 , 666.29));

			animateFOV(80);
			animateWaterNetworkViewSky();
			animateSunLightIntensity(1);

			world.watersupply.animateY(700);
			

			currView = 'waterNetwork';

		}

		function animateSilhouetteView() {

			resetView();

			animateCameraTo(new THREE.Vector3(-95.51 , 697.74 , 17.04), 
							new THREE.Vector3(-16988.94 , 308.43 , 1143.06),
							100);

			animateFOV(5);
			animateSilhouetteSky(100);
			animateSunLightIntensity(1);

			currView = 'silhouette';

		}


	// view ctrl GUI

		
		var viewCtrl = {

			silhouette: animateSilhouetteView,
			city: animateCityView,
			turbines: animateTurbinesView,
			landfill: animateLandfillView,
			waterNetwork: animateWaterNetworkView,
			tollway: animateTollwayView,
			lowAngle: animateLowAngleView,
			
		};

		guiViews.add(viewCtrl, 'silhouette');
		guiViews.add(viewCtrl, 'city');
		guiViews.add(viewCtrl, 'turbines');
		guiViews.add(viewCtrl, 'landfill');
		guiViews.add(viewCtrl, 'waterNetwork');
		guiViews.add(viewCtrl, 'tollway');
		guiViews.add(viewCtrl, 'lowAngle');
		
