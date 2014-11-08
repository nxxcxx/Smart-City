
	window.addEventListener('keypress', function (event) {
		if (event.keyCode === 32) {	// if spacebar is pressed
			event.preventDefault();
		}
		if (event.keyCode === 99) {	// if 'C' is pressed
			event.preventDefault();
			console.log('CTGT:', cameraCtrl.target.x.toFixed(2), ',', cameraCtrl.target.y.toFixed(2), ',', cameraCtrl.target.z.toFixed(2));
			console.log('CPOS:', cameraCtrl.object.position.x.toFixed(2), ',', cameraCtrl.object.position.y.toFixed(2), ',', cameraCtrl.object.position.z.toFixed(2));
			console.log('FOV:', camera.fov);
		}
	});

	// fullscreen
	document.body.addEventListener('keypress', function(event) {
		if (event.keyCode === 102) {	// if 'F' is pressed
			event.preventDefault();
			THREEx.FullScreen.request();
		}
	}, false);

	window.addEventListener('resize', onWindowResize, false);
	function onWindowResize() {
		screenWidth = window.innerWidth;
		screenHeight = window.innerHeight;
		camera.aspect = screenWidth / screenHeight;
		camera.updateProjectionMatrix();
		renderer.setSize(screenWidth, screenHeight);

		FXAApass.uniforms['resolution'].value.set(1 / (window.innerWidth * dpr), 1 / (window.innerHeight * dpr));
  		composer.setSize(window.innerWidth * dpr, window.innerHeight * dpr);

	}

	// document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	// function onDocumentMouseMove( event ) {
	// 	event.preventDefault();
	// 	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	// 	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	// }

	// document.addEventListener( 'click', onClick, false);
	// function onClick( event ) {
	// 	event.preventDefault();
	// } 