
function initLensflare() {

	// dirt
	var lensFlare = new THREE.LensFlare( assetManager.getTexture('lensdirtTex'),
										 2048, 0.0, THREE.AdditiveBlending, new THREE.Color( 0x555555 ) );

	// sun
	lensFlare.add( assetManager.getTexture('lensFlare01Tex'), 
				   1024, 0.0, THREE.AdditiveBlending, new THREE.Color( 0x888888 ));

	// hoop
	lensFlare.add( assetManager.getTexture('lensFlareHoopTex'), 
				   512, 1.0, THREE.AdditiveBlending, new THREE.Color( 0xdddddd ));


	lensFlare.position.copy(sunlight.position);
	lensFlare.customUpdateCallback = lensFlareUpdateCallback;

	// scene.add(lensFlare), moved this function now return flare object
	return lensFlare;


	function lensFlareUpdateCallback( object ) {

		var flarePosition = world.sky.sunPosition.clone();

		if (currView === 'tollway') {
			flarePosition.y += 50000;
		}

		object.position.copy( flarePosition );
		// object.position.copy(sunlight.position);

		var vecX = -object.positionScreen.x * 2;
		var vecY = -object.positionScreen.y * 2;

		var f, fl = object.lensFlares.length;
		for( f = 0; f < fl; f++ ) {


			var flare = object.lensFlares[f];
			flare.rotation = 0;

			if ( f > 0 ) {	// no need screen movement for lens dirt
				flare.x = object.positionScreen.x + vecX * flare.distance;
				flare.y = object.positionScreen.y + vecY * flare.distance;
			}
			
			

		}


		// use dot product to find angle to auto rotate flare
			var sunDirection = new THREE.Vector2(object.positionScreen.x, object.positionScreen.y);
			var distToScreenCen = Math.min( sunDirection.length(), 1.0 );

			sunDirection.normalize();
			var upVector = new THREE.Vector2(0, 1);
			var angleToSun = sunDirection.dot(upVector);
			angleToSun = Math.acos( THREE.Math.clamp( angleToSun, - 1, 1 ) );

			if (object.positionScreen.x > 0) {
				angleToSun *= -1;
			}

			object.lensFlares[2].rotation = angleToSun;


		// scale flare according to dist from center 
		// (use ease out cubic beacuse its too small near center), distance must range between [0, 1]
			
			object.lensFlares[2].size = outCubic(distToScreenCen) * 512;

			function outCubic(t) {
				return (--t)*t*t+1;
			}

	}


} // end initLensFlare