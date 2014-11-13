
	var currView = 'city';

	function animate(time) {

		world.shore1.spinTurbines();
		world.ocean.updateOcean();
		
	}

	// Gui auto update

	function updateGuiSky() {
		for (var i in guiSky.__controllers) {
			guiSky.__controllers[i].updateDisplay();
		}
	}

	function updateGuiLight() {
		sunlightColor.color = '#' + sunlight.color.getHexString();
		for (var i in guiDebug.__controllers) {
			guiDebug.__controllers[i].updateDisplay();
		}
	}

	// -------- Main animation

		function animateCameraTo(target, position, speed) {

			new TWEEN.Tween( cameraCtrl.target )
				.to( {	x: target.x,
						y: target.y,
						z: target.z
					 }, speed || 1000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() {
					cameraCtrl.update();
					debugCamNeedUpdate = true;
				})
			.start();

			new TWEEN.Tween( cameraCtrl.object.position )
				.to( {	x: position.x,
						y: position.y,
						z: position.z
					 }, speed || 1000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() {
					cameraCtrl.update();
					debugCamNeedUpdate = true;
				})
			.start();

		}

		function animateFOV(fov) {
			new TWEEN.Tween( camera )
				.to( {	fov: fov
					 }, 1000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() { 
					camera.updateProjectionMatrix();
					debugCamNeedUpdate = true;
				})
			.start();
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
			new TWEEN.Tween( sunlight )
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

			animateCameraTo(new THREE.Vector3(-971.34, 161.60, 971.36), 
							new THREE.Vector3(-1906.23, 325.49, 927.34));

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
		
