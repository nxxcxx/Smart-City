
	var currView = 'city';

	function animate(time) {

		world.shore1.spinTurbines();
		if (world.ocean) world.ocean.updateOcean();

	}

	// Gui auto update

	function updateGuiSky() {
		for (var i in guiSky.__controllers) {
			guiSky.__controllers[i].updateDisplay();
		}
	}

	function updateGuiLight() {
		sunlightColor.color = '#' + sunlight.color.getHexString();
		for (var i in guiSunlight.__controllers) {
			guiSunlight.__controllers[i].updateDisplay();
		}
	}

	function updateGuiOcean() {
		for (var i in guiOcean.__controllers) {
			guiOcean.__controllers[i].updateDisplay();
		}
	}

	// -------- Main animation

		function setCamera(target, position) {
			cameraCtrl.target.copy(target);
			cameraCtrl.object.position.copy(position);
		}

		function animateCameraTo(target, position, speed, callback) {

			new TWEEN.Tween( cameraCtrl.target )
				.to( {	x: target.x,
						y: target.y,
						z: target.z
					 }, speed || 1000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() {
					cameraCtrl.update();
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
				})
			.start()
			.onComplete(function() {
				if (callback) callback();
			});

		}

		function animateFOV(fov, speed) {
			new TWEEN.Tween( camera )
				.to( {	fov: fov
					 }, speed || 1000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() { 
					camera.updateProjectionMatrix();
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

		function animateFrontLightIntensity(x) {
			new TWEEN.Tween( frontLight )
				.to( { intensity: x }, 3000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() {
					
				})
			.start();
		}

		function animateBackLightIntensity(x) {
			new TWEEN.Tween( backLight )
				.to( { intensity: x }, 3000 )
				.easing( TWEEN.Easing.Quadratic.Out)
				.onUpdate(function() {
					
				})
			.start();
		}

		function animateClearSky(speed) {
			animateSky(33, 2, 0.088, 0.07, 0.13, 0.65, 0.83, speed);
		}

		function animateSunsetSky(speed) {
			animateSky(20, 4, 0.1, 0.93, 0.35, 0.49, 0.86, speed);
		}

		function animateSilhouetteSky(speed) {
			animateSky(20, 0.9, 0.067, 0.58, 1.17, 0.38, 0.48, speed);
		}

		function animateCityViewSky(speed) {
			// bright sky
			animateSky(20, 0.1, 0.1, 0, 0.02, 0.72, 0.83, speed);
		}

		function animateWaterNetworkViewSky(speed) {
			animateSky(4, 2, 0.057, 0.49, 0.22, 0.73, 0.94, speed);
		}

		function animateTurbineViewSky(speed) {
			animateSky(40, 1.4, 0.1, 0.64, 0.25, 0.68, 0.58, speed);
		}

		function animateVerticalTurbineViewSky(speed) {
			animateSky(20, 1.1, 0.088, 0.25, 0.17, 0.71, 0.85, speed);
		}

		function animateLandfillViewSky(speed) {
			animateSky(18, 1.9, 0.009, 0.74, 0.7, 1, 0.91, speed);
		}

		function animateOceanExposure(e) {
			if (!world.ocean) return;
			new TWEEN.Tween( world.ocean )
				.to( { exposure: e}, 1000 )
				.easing( TWEEN.Easing.Quadratic.Out)
					.onUpdate(function() {
						world.ocean.changed = true;
						updateGuiOcean();
					})
			.start();
		}


	// --------- City Views Animation

		function resetView() {

			// clear all active animation
			TWEEN.removeAll();

			animateContentOut();

			animateOceanExposure(0.2);
			animateFrontLightIntensity(0.0);
			animateBackLightIntensity(0.5);

			world.watersupply.animateResetPos();
			world.beacon.visible = false;

		}

		function animateCityView() {

			resetView();

			animateContentIn('#smartcity');

			animateCameraTo(new THREE.Vector3( -257.72, 233.92, 204.84 ), 
							new THREE.Vector3( -1691.96, 212.43, 369.93 ));

			animateFOV(80);
			animateCityViewSky();
			animateSunLightIntensity(1);

			animateCameraRotateLeft();
			
			currView = 'city';

		}

		function animateTurbinesView() {

			resetView();

			animateContentIn('#windfarm');

			animateCameraTo(new THREE.Vector3( -954.99, 251.94, 957.54 ), 
							new THREE.Vector3( -1894.62, 378.96, 1018.93 ));

			animateFOV(90);
			animateTurbineViewSky(500);
			animateSunLightIntensity(1);
			animateFrontLightIntensity(2.0);
			animateOceanExposure(0.1);

			currView = 'turbines';

		}

		function animateVerticalTurbinesView() {

			resetView();

			animateContentIn('#windfarm');

			animateCameraTo(new THREE.Vector3( -1466.34, 325.40, 838.34 ), 
							new THREE.Vector3( -993.63, 182.01, 581.76 ));

			animateFOV(90);
			animateVerticalTurbineViewSky(500);
			animateSunLightIntensity(1);
			animateFrontLightIntensity(0);
			animateOceanExposure(0.04);

			currView = 'turbines';

		}

		function animateHubView() {

			resetView();

			animateContentIn('#bipv');

			animateCameraTo(new THREE.Vector3(-31.30, 581.13, 372.64), 
							new THREE.Vector3(-462.15, 171.85, -245.54));

			animateFOV(120);
			animateClearSky();
			animateSunLightIntensity(1);

			currView = 'bipv';

		}

		function animateLandfillView() {

			resetView();

			animateContentIn('#landfill');

			animateCameraTo(new THREE.Vector3(1426.91, -334.68, 267.19), 
							new THREE.Vector3(1035.25, 410.91, -1191.15));

			animateFOV(80);
			animateClearSky();
			animateLandfillViewSky();
			animateSunLightIntensity(1.6);


			currView = 'landfill';

		}

		function animateWaterNetworkView() {

			resetView();

			animateContentIn('#water-network');

			animateCameraTo(new THREE.Vector3(832.43 , 397.33 , 697.43),
							new THREE.Vector3(21.29 , 694.72 , 666.29));

			animateFOV(80);
			animateWaterNetworkViewSky();
			animateSunLightIntensity(2.0);

			world.watersupply.animateY(700);
			

			currView = 'waterNetwork';

		}

		function animateTollwayView() {

			resetView();

			animateContentIn('#street');

			animateCameraTo(new THREE.Vector3(-1568.77 , -343.81 , 262.49), 
							new THREE.Vector3(-134.94 , 246.37 , -75.15), 2000);

			animateFOV(110);
			animateSunsetSky(3000);
			animateSunLightIntensity(0, 0, 0);
			animateBackLightIntensity(0.1);
			animateOceanExposure(0.01);

			currView = 'tollway';

		}

		function animateSensorView() {

			resetView();

			animateContentIn('#sensor');

			animateCameraTo(new THREE.Vector3( 491.80, 51.46, -60.71 ), 
							new THREE.Vector3(  1130.75, 959.48, 621.40 ));

			animateFOV(80);
			animateCityViewSky();
			animateSunLightIntensity(1);

			world.beacon.visible = true;
			
			currView = 'sensor';

		}

		function animateSilhouetteView() {

			resetView();

			animateCameraTo(new THREE.Vector3(-95.51 , 697.74 , 17.04), 
							new THREE.Vector3(-16988.94 , 308.43 , 1143.06),
							100);

			animateFOV(5);
			animateSilhouetteSky(100);
			animateSunLightIntensity(1);
			animateOceanExposure(0.01);

			currView = 'silhouette';

		}


	// view ctrl GUI

		
		var viewCtrl = {

			silhouette: animateSilhouetteView,
			city: animateCityView,
			turbines: animateVerticalTurbinesView,
			landfill: animateLandfillView,
			waterNetwork: animateWaterNetworkView,
			tollway: animateTollwayView,
			hub: animateHubView,
			sensor: animateSensorView,
			
		};

		// guiViews.add(viewCtrl, 'silhouette');
		guiViews.add(viewCtrl, 'city').name('City');
		guiViews.add(viewCtrl, 'turbines').name('Wind Farm');
		guiViews.add(viewCtrl, 'hub').name('BIPV');
		guiViews.add(viewCtrl, 'landfill').name('Landfill');
		guiViews.add(viewCtrl, 'waterNetwork').name('Water Supply Network');
		guiViews.add(viewCtrl, 'tollway').name('Street');
		guiViews.add(viewCtrl, 'sensor').name('Acoustic Sensor');
		


// content bar


	var contentBar = $('.content-container');
	function animateContentOut() {
		contentBar.children().stop().fadeOut({
			queue: false,
			duration: 500
		});
	}

	function animateContentIn(elem) {
		$(elem).stop().fadeIn({
			queue: false,
			duration: 500
		});
	}



// photo SlideShow @param elem w/ img tags inside
	function SlideShow(elem) {

		this._imgArr = $(elem).children();
		this._currIdx = 1;
		this._timeout = null;

		this.duration = 1000;
		this.delay = 1500;
		this.auto = true;

		this.start();

	}

	SlideShow.prototype.start = function() {
		
		var self = this;

		if (this._timeout) {clearTimeout(this._timeout);}
		this._timeout = setTimeout(doFadeStuff, this.delay);

		function doFadeStuff() {
			
			self.fadeOutAll();
			if ( !self._imgArr[self._currIdx] ) { self._currIdx = 0; }
			$(self._imgArr[self._currIdx]).stop().fadeIn({
				duration: self.duration,
				complete: self.auto ? $.proxy(self.start, self) : null
			});
			self._currIdx += 1;
		}

	};

	SlideShow.prototype.fadeOutAll = function() {
		this._imgArr.stop().fadeOut(this.duration);
	};


// idle camera animation

	function animateCameraRotateLeft(duration, step) {

		var temp = {value: 0};
		new TWEEN.Tween( temp )
			.to( {value: 1}, duration || 10000 )
			.easing( TWEEN.Easing.Linear.None )
			.onUpdate(function() {
				cameraCtrl.rotateLeft(step || 0.00035);
			})
		.start();

	}

	function animateCameraRotateUp(duration, step) {

		var temp = {value: 0};
		new TWEEN.Tween( temp )
			.to( {value: 1}, duration || 10000 )
			.easing( TWEEN.Easing.Linear.None )
			.onUpdate(function() {
				cameraCtrl.rotateUp(step || 0.00035);
			})
		.start();

	}

