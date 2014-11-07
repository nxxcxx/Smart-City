

	var world = {};

	THREE.Object3D.prototype.setDefaultPos = function(x, y, z) {
		this.position.set(x, y, z);
		this.oripos = this.position.clone();
	};


	function startScene() {

		
		// Experiment stuff
			// // test shader 

			// 	var seaShaderUniforms = {
			// 		time: { type: "f", value: 1.0 },
			// 		resolution: { type: "v2", value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
			// 	};

			// 	var seaShaderMat = new THREE.ShaderMaterial( {

			// 		uniforms: seaShaderUniforms,
			// 		vertexShader: document.getElementById( 'vertexShader' ).textContent,
			// 		fragmentShader: document.getElementById( 'fragmentShader' ).textContent,

			// 	} );

			// 	// var shaderMesh = new THREE.Mesh( new THREE.BoxGeometry(2000, 10, 2000), seaShaderMat );
			// 	// shaderMesh.position.y = 2000;
			// 	// scene.add( shaderMesh );



		// private stuff
		(function init() {

			// create base shell for cloning
			var shell = constructModel('shell', {map: 'shellTex'});
			shell.castShadow = false;
			shell.receiveShadow = false;

		})();

		// ------- Model helper

		function constructModel(modelKey, settings) {

			var model = assetManager.getModel(modelKey);

			var material = new THREE.MeshLambertMaterial({
				shading: THREE.FlatShading
			});

			_.each(settings, function(value, key, list) {

				if (key === 'map' || key === 'envMap') {
					value = assetManager.getTexture(value);
				} else if (key === 'color' || key === 'emissive') {
					value = new THREE.Color(value);
				}
				material[key] = value;

			});

			assetManager.addMaterial(modelKey, material);	// use modelName as materialName
			model.material = material;

			return model;
		}

		function getNewShell() {

			return assetManager.getModel('shell').clone();
		}
		


		// world stuff

		world.sky = initSky(); // do magic by zz85

		world.shore1 = (function () {

			var shore = new THREE.Object3D();
			var shorePlatform = constructModel('shorePlatform', {map: 'shorePlatformTex'});
			var shoreWaterSurface = constructModel('shoreWaterSurface', {map:'shoreWaterSurfaceTex' , envMap: 'reflectionCube', opacity: 0.9, transparent: true});
			shorePlatform.castShadow = false;

			// overridw w/ shader
			// shoreWaterSurface.material = seaShaderMat;

			shore.add(shorePlatform, shoreWaterSurface);
			shore.setDefaultPos(-1402, 0, 811);

			return shore;

		})();

		world.shore2 = (function () {

			var shore = world.shore1.clone();
			shore.setDefaultPos(-702, 0, 1215);
			return shore;

		})();

		world.shore3 = (function () {

			var shore = world.shore1.clone();
			shore.setDefaultPos(-1, 0, 1623);
			return shore;

		})();
		
		world.turbines = (function () {

			var allTurbines = new THREE.Object3D();
			var windTurbine = new THREE.Object3D();
			var turBase = constructModel('turbineBase', {map: 'turbineBaseTex'});
			var turPro = constructModel('propeller', {});


			turPro.position.set(0, 268, -10);

			windTurbine.add(turBase);
			windTurbine.add(turPro);
			
			var windTurbine2 = windTurbine.clone();
			var windTurbine3 = windTurbine.clone();

			windTurbine.position.set(-1629, 90, 740);
			windTurbine2.position.set(-1454, 90, 842);
			windTurbine3.position.set(-1286, 90, 940);

			windTurbine.rotation.y = 
			windTurbine2.rotation.y = 
			windTurbine3.rotation.y = THREE.Math.degToRad(110);

			allTurbines.add(windTurbine, windTurbine2, windTurbine3);

			allTurbines.spin = function () {
				windTurbine.children[1].rotation.z += 0.05;
				windTurbine2.children[1].rotation.z += 0.05;
				windTurbine3.children[1].rotation.z += 0.05;
			};

			return allTurbines;

		})();
			
		world.hub = (function () {

			var hub = new THREE.Object3D();
			var hubWindow = constructModel('hubWindow', {map: 'hubWindowTex', envMap: 'reflectionCube', reflectivity: 0.9});
			var hubPlatform = constructModel('hubPlatform', {map: 'hubPlatformTex'});
			var hubStreetLine = constructModel('hubStreetLine', {emissive: 0x0066ff});
			hubStreetLine.castShadow = false;
			hubStreetLine.receiveShadow = false;
			var hubShell = getNewShell();
			hub.add(hubShell, hubPlatform, hubWindow, hubStreetLine);
			hub.setDefaultPos(0, 0, 0);
			return hub;

		})();

		world.city01 = (function () {

			var city01 = new THREE.Object3D();
			var city01Buildings = constructModel('city01', {map: 'city01Tex'});
			var city01Shell = getNewShell();
			city01.setDefaultPos(0, 0, -808);
			city01.add(city01Buildings, city01Shell);
			return city01;

		})();

		world.city02 = (function () {

			var city02 = new THREE.Object3D();
			var city02Buildings = constructModel('city02', {map: 'city02Tex'});
			var city02Shell = getNewShell();
			city02.setDefaultPos(700, 0, -405);
			city02.add(city02Buildings, city02Shell);
			return city02;

		})();

		world.city03 = (function () {

			var city03 = new THREE.Object3D();
			var city03Buildings = constructModel('city03', {map: 'city03Tex'});
			var city03Shell = getNewShell();
			city03.setDefaultPos(0, 0, 810);
			city03.add(city03Buildings, city03Shell);
			return city03;

		})();
		
		world.tollway = (function () {

			var tollway = new THREE.Object3D();
			var tollwayStreet = constructModel('tollway', {map: 'tollwayTex'});
			var tollwayLine = constructModel('tollwayLine', {emissive: 0x0066ff});
			tollwayLine.castShadow = false;
			tollwayLine.receiveShadow = false;
			var tollwayShell = getNewShell();
			tollway.setDefaultPos(-702, 0, -403);
			tollway.add(tollwayStreet, tollwayLine, tollwayShell);
			return tollway;

		})();
			
		world.landfill = (function () {

			var landfill = new THREE.Object3D();
			var lf = constructModel('landfill', {map: 'landfillTex'});
			var lfshell = getNewShell();
			landfill.add(lf, lfshell);
			landfill.setDefaultPos(1403, 0, -805);
			return landfill;

		})();

		world.watersupply = (function () {

			var watersupply = new THREE.Object3D();
			var ws = constructModel('watersupply', {map: 'watersupplyTex'});
			var wsshell = getNewShell();
			watersupply.add(ws, wsshell);
			watersupply.setDefaultPos(700, 0, 405);
			return watersupply;

		})();

		world.resident1 = (function () {

			var resident01 = new THREE.Object3D();
			var resident01Buildings = constructModel('resident01', {map: 'resident01Tex'});
			var resident01Shell = getNewShell();
			resident01.setDefaultPos(-701, 0, -1213);
			resident01.rotation.y = THREE.Math.degToRad(120);
			resident01.add(resident01Buildings, resident01Shell);
			return resident01;

		})();

		world.resident2 = (function () {

			var resident02 = new THREE.Object3D();
			var resident02Buildings = constructModel('resident02', {map: 'resident02Tex'});
			var resident02Shell = getNewShell();
			resident02.setDefaultPos(-1403, 0, -809);
			resident02.add(resident02Buildings, resident02Shell);
			return resident02;

		})();

		world.resident3 = (function () {

			var resident03 = world.resident2.clone();
			resident03.setDefaultPos(-1403, 0, -0);
			resident03.rotation.y = THREE.Math.degToRad(120);
			return resident03;

		})();

		world.resident4 = (function () {

			var resident04 = world.resident1.clone();
			resident04.setDefaultPos(-701, 0, 406);
			resident04.rotation.y = THREE.Math.degToRad(0);
			return resident04;

		})();
		
		world.eplatform1 = (function () {

			var ep01 = new THREE.Object3D();
			var ep = constructModel('emptyPlatform', {map: 'emptyPlatformTex'});
			var epshell = getNewShell();
			ep01.add(ep, epshell);
			ep01.setDefaultPos(0, 0, -1618);
			return ep01;

		})();

		world.eplatform2 = (function () {

			var ep02 = world.eplatform1.clone();
			ep02.setDefaultPos(700, 0, -1211);
			return ep02;

		})();

		world.eplatform3 = (function () {

			var ep03 = world.eplatform1.clone();
			ep03.setDefaultPos(1398, 0, 0);
			return ep03;

		})();

		world.eplatform4 = (function () {

			var ep04 = world.eplatform1.clone();
			ep04.setDefaultPos(1398, 0, 807);
			return ep04;

		})();
		

		world.eplatform5 = (function () {

			var ep05 = world.eplatform1.clone();
			ep05.setDefaultPos(700, 0, 1216);
			return ep05;

		})();

		// --- add all to scene
		_.each(world, function (object) {
			scene.add(object);
		});


	}	// end startScene fn


	function animate(time) {

		// seaShaderUniforms.time.value = time*0.0005;
		world.turbines.spin();

	}

	// draw loop
	function render(time) {
		requestAnimationFrame(render);
		TWEEN.update(time);
		animate(time);
		renderer.setClearColor(scene_settings.bgColor, 1);
		
		// intersectMouse(assetManager.getModel('hubBuilding'));

		// renderer.render(scene, camera);
		composer.render();

		stats.update();
	}



	// --------- Extend animation methods

		THREE.Object3D.prototype.animateResetPos = function () {
			new TWEEN.Tween( this.position ).to( {
				x: this.oripos.x,
				y: this.oripos.y,
				z: this.oripos.z }, 
				1000 )
			.easing( TWEEN.Easing.Quadratic.Out)
			.start();
		};


		THREE.Object3D.prototype.animatePos = function (x, y, z) {
			new TWEEN.Tween( this.position ).to( {
				x: x,
				y: y,
				z: z }, 
				1000 )
			.easing( TWEEN.Easing.Quadratic.Out)
			.start();
		};




	// ------ prototype function


		// --- test ray caster 3D object-mouse intersection todo: check platform's children if contain intersected mesh then do sth

			// var raycaster = new THREE.Raycaster();
			// function intersectMouse(mesh) {
				
			// 	var vector = new THREE.Vector3( mouse.x, mouse.y, 1 ).unproject( camera );

			// 	raycaster.set( camera.position, vector.sub( camera.position ).normalize() );

			// 	var intersects = raycaster.intersectObject( mesh );

			// 	if ( intersects.length > 0 ) {
			// 		var intersect = intersects[0];
			// 		console.warn(intersects);
			// 		if (intersect.object == mesh) {  // r69 now return face3
			// 			console.warn(111);
			// 		}

			// 	}
			// }
		
		// --- test camera animation

			function animateCameraTo(target, position) {

				new TWEEN.Tween( cameraCtrl.target )
					.to( {	x: target.x,
							y: target.y,
							z: target.z
						 }, 1000 )
					.easing( TWEEN.Easing.Quadratic.Out)
					.onUpdate(function() {cameraCtrl.update();})
				.start();

				new TWEEN.Tween( cameraCtrl.object.position )
					.to( {	x: position.x,
							y: position.y,
							z: position.z
						 }, 1000 )
					.easing( TWEEN.Easing.Quadratic.Out)
					.onUpdate(function() {cameraCtrl.update();})
				.start();

			}

			function animateFOV(fov) {
				new TWEEN.Tween( camera )
					.to( {	fov: fov
						 }, 1000 )
					.easing( TWEEN.Easing.Quadratic.Out)
					.onUpdate(function() { camera.updateProjectionMatrix(); })
				.start();
			}

			function animateSky(a, b, c, d, e, f, g) {
				var sky = world.sky;
				new TWEEN.Tween( sky.ctrl )
					.to( {	turbidity: a,
							reileigh: b,
							mieCoefficient: c,
							mieDirectionalG: d,
							liminance: e,
							inclination: f,
							azimuth: g
						 }, 3000 )
					.easing( TWEEN.Easing.Quadratic.Out)
					.onUpdate(function() {sky.updateCtrl();})
				.start();
			}

			function animateDirLightColor(r, g, b) {
				new TWEEN.Tween( DirLight.color )
					.to( {	r: r, 
							g: g,
							b: b
						 }, 3000 )
					.easing( TWEEN.Easing.Quadratic.Out)
					.onUpdate(function() {})
				.start();
			}



			// --------- City Views Animation

			function animateCityView() {

				animateCameraTo(new THREE.Vector3(0, 0, 0), 
								new THREE.Vector3(-1803.76 , 2157.32 , -60.32));

				animateFOV(80);
				animateSky(4.8, 4, 0.06, 0.76, 0.35, 0.86, 0.9); // clear sky
				animateDirLightColor(1, 1, 1);

			}

			function animateTollwayView() {

				animateCameraTo(new THREE.Vector3(215.35 , 70.55 , 1377.40), 
								new THREE.Vector3(-570.12 , 216.03 , -188.98));

				animateFOV(100);
				animateSky(20, 4, 0.1, 0.93, 0.11, 0.5, 0.65);	//sunset sky: 20, 4, 0.1, 0.93, 0.11, 0.5, 0.67
				animateDirLightColor(0, 0, 0);
			}

			function animateHighAngleView() {

				animateCameraTo(new THREE.Vector3(-31.30, 581.13, 372.64), 
								new THREE.Vector3(-462.15, 171.85, -245.54));

				animateFOV(120);
				animateSky(4.8, 4, 0.06, 0.76, 0.35, 0.86, 0.9);
				animateDirLightColor(1, 1, 1);

			}







