

	window.addEventListener('keypress', function (event) {
		if (event.charCode === 32) {	// if spacebar is pressed
			event.preventDefault();
			gui.closed = !gui.closed; // toggle gui

		}
		if (event.charCode === 102) {	// if 'F' is pressed
			event.preventDefault();
			THREEx.FullScreen.request();
		}
	});


	var mouseDownFlag = 0;

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	function onDocumentMouseMove( event ) {
		event.preventDefault();
		mouse.x = ( event.clientX / screenWidth ) * 2 - 1;
		mouse.y = - ( event.clientY / screenHeight ) * 2 + 1;

		if (mouseDownFlag) {
			TWEEN.removeAll();
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



