
function initLensflare() {

	// dirt
	var lensFlare = new THREE.LensFlare( assetManager.getTexture('lensdirtTex'),
										 2048, 0.0, THREE.AdditiveBlending, new THREE.Color( 0x444444 ) );

	// sun
	lensFlare.add( assetManager.getTexture('lensFlare01Tex'), 
				   1024, 0.0, THREE.AdditiveBlending, new THREE.Color( 0x888888 ));

	// hoop
	lensFlare.add( assetManager.getTexture('lensFlareHoopTex'), 
				   512, 1.0, THREE.AdditiveBlending, new THREE.Color( 0xffffff ));


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

		// auto rotate lens hoop when sun is at left or right of screen coords
		object.lensFlares[2].rotation = -object.positionScreen.x * Math.PI/2.0;


	}


} // end initLensFlare