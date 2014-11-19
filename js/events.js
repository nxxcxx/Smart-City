

	window.addEventListener('keypress', function (event) {

		event.preventDefault();

		if (event.charCode === 32) {	// spacebar
			
			gui.closed = !gui.closed;

		}
		if (event.charCode === 102) {	// F
			THREEx.FullScreen.request();
		}

		if (event.charCode === 97) {	// A
			animateCityView();
		}
		if (event.charCode === 113) {	// Q
			animateVerticalTurbinesView();
		}
		if (event.charCode === 119) {	// W
			animateHubView();
		}
		if (event.charCode === 101) {	// E
			animateLandfillView();
		}
		if (event.charCode === 114) {	// R
			animateWaterNetworkView();
		}
		if (event.charCode === 116) {	// T
			animateTollwayView();
		}
		if (event.charCode === 121) {	// Y
			animateSensorView();
		}



	});


	var mouseDownFlag = 0;

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	function onDocumentMouseMove( event ) {
		event.preventDefault();
		mouse.x = ( event.clientX / screenWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / screenHeight ) * 2 + 1;

		if (mouseDownFlag) {
			// TWEEN.removeAll();
		}
	}

	document.addEventListener( 'click', onClick, false);
	function onClick( event ) {
		event.preventDefault();
	} 

	document.addEventListener( 'mousedown', function () {
		mouseDownFlag = 1;
	});

	document.addEventListener( 'mouseup', function () {
		mouseDownFlag = 0;
	});




	window.addEventListener('resize', onWindowResize, false);
	function onWindowResize() {
		screenWidth = window.innerWidth;
		screenHeight = window.innerHeight;
		camera.aspect = screenWidth / screenHeight;
		camera.updateProjectionMatrix();
		
		renderer.setSize(screenWidth, screenHeight);
		composer.setSize(screenWidth, screenHeight);

		FXAApass.uniforms['resolution'].value.set(1/screenWidth, 1/screenHeight);
	}



