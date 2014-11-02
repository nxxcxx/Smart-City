
	// browser events
	// window.addEventListener('keypress', function (event) {
	// 	if (event.keyCode === 32) {	// if spacebar is pressed
	// 		event.preventDefault();
	// 	}
	// });

	window.addEventListener('resize', onWindowResize, false);
	function onWindowResize() {
		var w = window.innerWidth;
		var h = window.innerHeight;
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		renderer.setSize(w, h);
	}