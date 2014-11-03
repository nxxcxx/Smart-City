
	(function run() {

		requestAnimationFrame(run);
		renderer.setClearColor(scene_settings.bgColor, 1);

		// if (par) {
		// 	par.rotation.y += 0.01;
		// }

		renderer.render(scene, camera);
		stats.update();

	})();