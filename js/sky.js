// sky by zz85
function initSky(){

	// Add Sky Mesh
	sky = new THREE.Sky();
	scene.add( sky.mesh );

	// Add Sun Helper
	sunSphere = new THREE.Mesh( new THREE.SphereGeometry( 20000, 30, 30 ),
		new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: false }));
	sunSphere.position.y = -700000;
	sunSphere.visible = true;
	scene.add( sunSphere );

	/// GUI
	var effectController  = {
		turbidity: 10,
		reileigh: 2,
		mieCoefficient: 0.005,
		mieDirectionalG: 0.8,
		luminance: 1,
		inclination: 0.49, // elevation / inclination
		azimuth: 0.5, // Facing front,					
		sun: !true
	};

	var distance = 400000;

	function guiChanged() {
		var uniforms = sky.uniforms;
		uniforms.turbidity.value = effectController.turbidity;
		uniforms.reileigh.value = effectController.reileigh;
		uniforms.luminance.value = effectController.luminance;
		uniforms.mieCoefficient.value = effectController.mieCoefficient;
		uniforms.mieDirectionalG.value = effectController.mieDirectionalG;
		var theta = Math.PI * (effectController.inclination - 0.5);
		var phi = 2 * Math.PI * (effectController.azimuth - 0.5);
		sunSphere.position.x = distance * Math.cos(phi);
		sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta); 
		sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta); 
		sunSphere.visible = effectController.sun;
		sky.uniforms.sunPosition.value.copy(sunSphere.position);
	}

	var gui = new dat.GUI();
	var guiSky = gui.addFolder('Sky');
	guiSky.add( effectController, "turbidity", 1.0, 20.0, 0.1 ).onChange( guiChanged );
	guiSky.add( effectController, "reileigh", 0.0, 4, 0.001 ).onChange( guiChanged );
	guiSky.add( effectController, "mieCoefficient", 0.0, 0.1, 0.001 ).onChange( guiChanged );
	guiSky.add( effectController, "mieDirectionalG", 0.0, 1, 0.001 ).onChange( guiChanged );
	guiSky.add( effectController, "luminance", 0.0, 2).onChange( guiChanged );;
	guiSky.add( effectController, "inclination", 0, 1, 0.0001).onChange( guiChanged );
	guiSky.add( effectController, "azimuth", 0, 1, 0.0001).onChange( guiChanged );
	guiSky.add( effectController, "sun").onChange( guiChanged );
	guiChanged();

}