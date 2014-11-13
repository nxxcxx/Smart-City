// ---- Lights

	var SHADOW_MAP_WIDTH = scene_settings.shadowMapSize, SHADOW_MAP_HEIGHT = scene_settings.shadowMapSize;

	// sun light
	var sunlight = new THREE.DirectionalLight(0xffffff, 1.0);	//0x331100

	// sunlight pos now control by sky
	// var sunlightDir = new THREE.Vector3(-4000, 3000, 3000);
	// var sunlightDist = 1000;
	// sunlight.position.set( sunlightDir.normalize().multiplyScalar(sunlightDist) );

		sunlight.castShadow = true;

		sunlight.shadowCameraNear = 8000;
		sunlight.shadowCameraFar = 12000;

		sunlight.shadowCameraLeft = -2000;
		sunlight.shadowCameraRight = 2000;
		sunlight.shadowCameraTop = 2000;
		sunlight.shadowCameraBottom = -2000;

		sunlight.shadowCameraVisible = true;

		sunlight.shadowCameraFov = 80;
		sunlight.shadowBias = 0.0001;
		sunlight.shadowDarkness = 0.77;

		sunlight.shadowMapWidth = SHADOW_MAP_WIDTH;
		sunlight.shadowMapHeight = SHADOW_MAP_HEIGHT;

		var sunlightColor = {color: '#ffffff'};
		var guiSunlight = guiDebug.addFolder('Sunlight');
		guiSunlight.add(sunlight, 'intensity', 0.0, 2.0, 0.1);
		guiSunlight.addColor(sunlightColor, 'color').name('color').onChange(updateLightCol);
		function updateLightCol(c) {
			sunlight.color.set(c);
		}


	scene.add(sunlight);


	// back light
	var backLight = new THREE.DirectionalLight(0xffffff, 0.5);
	backLight.position.set(1000, 1000, -1500);

	var backLightHelper = new THREE.DirectionalLightHelper(backLight, 100);
	scene.add(backLightHelper);
	scene.add(backLight);


	// // ambient light
	var ambLight = new THREE.AmbientLight(0x050506);
	scene.add(ambLight);

	function toggleHelper() {
		axisHelper.visible = scene_settings.enableHelper;
		grid.visible = scene_settings.enableHelper;
		sunlight.shadowCameraVisible = scene_settings.enableHelper;
		backLightHelper.visible = scene_settings.enableHelper;
	} 
	toggleHelper();