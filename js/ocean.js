
function initOcean(oceanGeom) {

	var gsize = 512*4; 
	var res = 1024; 
	var gres = res / 2;
	var origx = 0;
	var origz = 0;
	var ocean = new THREE.Ocean(oceanGeom, renderer, camera, scene, {
		INITIAL_SIZE : 265.0,
		INITIAL_WIND : [15.0, 15.0],
		INITIAL_CHOPPINESS : 3.7,
		CLEAR_COLOR : [1.0, 1.0, 1.0, 0.0],
		GEOMETRY_ORIGIN : [origx, origz],
		SUN_DIRECTION : [-1.0, 1.0, 1.0],
		OCEAN_COLOR: new THREE.Vector3(0.004, 0.016, 0.047),
		SKY_COLOR: new THREE.Vector3(3.2, 9.6, 12.8),
		EXPOSURE : 0.1,
		GEOMETRY_RESOLUTION: gres,
		GEOMETRY_SIZE : gsize,
		RESOLUTION : res,
	});
	ocean.materialOcean.uniforms.u_projectionMatrix = { type: "m4", value: camera.projectionMatrix };
	ocean.materialOcean.uniforms.u_viewMatrix = { type: "m4", value: camera.matrixWorldInverse };
	ocean.materialOcean.uniforms.u_cameraPosition = { type: "v3", value: camera.position };


	var lastTime = new Date().getTime();

	ocean.updateOcean = function updateOcean() {

		var currentTime = new Date().getTime();

		ocean.deltaTime = (currentTime - lastTime) * 0.001 || 0.0;

		lastTime = currentTime;
		ocean.render(ocean.deltaTime);
		ocean.overrideMaterial = ocean.materialOcean;
		if (ocean.changed) {
			ocean.materialOcean.uniforms.u_size.value = ocean.size;
			ocean.materialOcean.uniforms.u_sunDirection.value.set( ocean.sunDirectionX, ocean.sunDirectionY, ocean.sunDirectionZ );
			ocean.materialOcean.uniforms.u_exposure.value = ocean.exposure;
			ocean.changed = false;
		}
		ocean.materialOcean.uniforms.u_normalMap.value = ocean.normalMapFramebuffer ;
		ocean.materialOcean.uniforms.u_displacementMap.value = ocean.displacementMapFramebuffer ;
		ocean.materialOcean.uniforms.u_projectionMatrix.value = camera.projectionMatrix ;
		ocean.materialOcean.uniforms.u_viewMatrix.value = camera.matrixWorldInverse ;
		ocean.materialOcean.uniforms.u_cameraPosition.value = camera.position;
		ocean.materialOcean.depthTest = true;

		cameraCtrl.update();

	};


	guiOcean = guiDebug.addFolder('Ocean');
	var c1 = guiOcean.add(ocean, "size", 100, 5000);
	c1.onChange(function(v) {
		this.object.size = v;
		this.object.changed = true;
	});
	var c2 = guiOcean.add(ocean, "choppiness", 0.1, 4);
	c2.onChange(function (v) {
		this.object.choppiness = v;
		this.object.changed = true;
	});
	var c3 = guiOcean.add(ocean, "windX",-15, 15);
	c3.onChange(function (v) {
		this.object.windX = v;
		this.object.changed = true;
	});
	var c4 = guiOcean.add(ocean, "windY", -15, 15);
	c4.onChange(function (v) {
		this.object.windY = v;
		this.object.changed = true;
	});
	var c5 = guiOcean.add(ocean, "sunDirectionX", -1.0, 1.0);
	c5.onChange(function (v) {
		this.object.sunDirectionX = v;
		this.object.changed = true;
	});
	var c6 = guiOcean.add(ocean, "sunDirectionY", -1.0, 1.0);
	c6.onChange(function (v) {
		this.object.sunDirectionY = v;
		this.object.changed = true;
	});
	var c7 = guiOcean.add(ocean, "sunDirectionZ", -1.0, 1.0);
	c7.onChange(function (v) {
		this.object.sunDirectionZ = v;
		this.object.changed = true;
	});
	var c8 = guiOcean.add(ocean, "exposure", 0.0, 0.5);
	c8.onChange(function (v) {
		this.object.exposure = v;
		this.object.changed = true;
	});


	return ocean;

}