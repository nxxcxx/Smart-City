
// sky by zz85
function initSky() {

	// Add Sky Mesh
	var sky = new THREE.Sky();

	// Add Sun Helper
	var sunSphere = new THREE.Mesh( new THREE.SphereGeometry( 20000, 30, 30 ),
		new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: false }));
	sunSphere.position.y = -700000;
	scene.add( sunSphere );


	/// GUI
	sky.mesh.ctrl  = {
		turbidity: 18.9,
		reileigh: 4,
		mieCoefficient: 0.063,
		mieDirectionalG: 0.94,
		luminance: 0.35,
		inclination: 0.86,
		azimuth: 0.9,				
		sun: !true
	};

	var distance = 400000;

	sky.mesh.changeSetting = function (a,b,c,d,e,f,g) {
		sky.mesh.ctrl.turbidity	= a;
		sky.mesh.ctrl.reileigh	= b;
		sky.mesh.ctrl.mieCoefficient	= c;
		sky.mesh.ctrl.mieDirectionalG	= d;
		sky.mesh.ctrl.luminance	= e;
		sky.mesh.ctrl.inclination	= f;
		sky.mesh.ctrl.azimuth	= g;
	};

	sky.mesh.updateCtrl = function () {
		var uniforms = sky.uniforms;
		uniforms.turbidity.value = sky.mesh.ctrl.turbidity;
		uniforms.reileigh.value = sky.mesh.ctrl.reileigh;
		uniforms.luminance.value = sky.mesh.ctrl.luminance;
		uniforms.mieCoefficient.value = sky.mesh.ctrl.mieCoefficient;
		uniforms.mieDirectionalG.value = sky.mesh.ctrl.mieDirectionalG;
		var theta = Math.PI * (sky.mesh.ctrl.inclination - 0.5);
		var phi = 2 * Math.PI * (sky.mesh.ctrl.azimuth - 0.5);
		sunSphere.position.x = distance * Math.cos(phi);
		sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta); 
		sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta); 
		sunSphere.visible = sky.mesh.ctrl.sun;
		sky.uniforms.sunPosition.value.copy(sunSphere.position);


		sky.mesh.sunPosition = sunSphere.position;



		var lightDist = 10000;
		theta += 0.2; // offset light position to remove shadow map artifact when light is perpendicular with surface normal
		sunlight.position.x = lightDist * Math.cos(phi);
		sunlight.position.y = lightDist * Math.sin(phi) * Math.sin(theta); 
		sunlight.position.z = lightDist * Math.sin(phi) * Math.cos(theta); 

	};

	guiSky = guiDebug.addFolder('Sky');
	guiSky.add( sky.mesh.ctrl, "turbidity", 1.0, 40.0, 0.1 ).onChange( sky.mesh.updateCtrl );
	guiSky.add( sky.mesh.ctrl, "reileigh", 0.0, 4, 0.001 ).onChange( sky.mesh.updateCtrl );
	guiSky.add( sky.mesh.ctrl, "mieCoefficient", 0.0, 0.1, 0.001 ).onChange( sky.mesh.updateCtrl );
	guiSky.add( sky.mesh.ctrl, "mieDirectionalG", 0.0, 1, 0.001 ).onChange( sky.mesh.updateCtrl );
	guiSky.add( sky.mesh.ctrl, "luminance", 0.0, 2).onChange( sky.mesh.updateCtrl );
	guiSky.add( sky.mesh.ctrl, "inclination", 0, 1, 0.0001).onChange( sky.mesh.updateCtrl );
	guiSky.add( sky.mesh.ctrl, "azimuth", 0, 1, 0.0001).onChange( sky.mesh.updateCtrl );
	guiSky.add( sky.mesh.ctrl, "sun").onChange( sky.mesh.updateCtrl );
	sky.mesh.updateCtrl();


	return sky.mesh;

}