
// ---- Post-Processing

	// Render
		var renderPass = new THREE.RenderPass( scene, camera );

	// SSAO
		var depthShader = THREE.ShaderLib["depthRGBA"];
		var depthUniforms = THREE.UniformsUtils.clone( depthShader.uniforms );
		var depthMaterial = new THREE.ShaderMaterial( { fragmentShader: depthShader.fragmentShader, vertexShader: depthShader.vertexShader, uniforms: depthUniforms } );
		depthMaterial.blending = THREE.NoBlending;

		var depthTarget = new THREE.WebGLRenderTarget( 1024, 1024, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat } );

		var SSAOpass = new THREE.ShaderPass( THREE.SSAOShader );
		SSAOpass.uniforms[ 'tDepth' ].value = depthTarget;
		SSAOpass.uniforms[ 'size' ].value.set( 1024, 1024 );
		SSAOpass.uniforms[ 'cameraNear' ].value = camera.near;
		SSAOpass.uniforms[ 'cameraFar' ].value = 10000;
		SSAOpass.uniforms[ 'aoClamp' ].value = 0.59;
		SSAOpass.uniforms[ 'lumInfluence' ].value = 1.06;
		SSAOpass.uniforms[ 'onlyAO' ].value = 0;	// debug
	
		// SSAOpass.enabled = false;

	// FXAA
		var FXAApass = new THREE.ShaderPass( THREE.FXAAShader );
		FXAApass.uniforms['resolution'].value.set(1 / (screenWidth * dpr), 1 / (screenHeight * dpr));

	// Color Correction
		var CCpass = new THREE.ShaderPass( THREE.ColorCorrectionShader );

	// Bleach Bypass & E6C41
		var CCNIXpass = new THREE.ShaderPass( THREE.ColorCorrectionShaderNIX );

	// Copy to screen
		var copyPass = new THREE.ShaderPass( THREE.CopyShader );
		copyPass.renderToScreen = true;

	// test convolution gaussian blur
		// var cvPass = new THREE.ShaderPass( THREE.ConvolutionShader );
		// cvPass.uniforms['cKernel'].value = [1/16, 2/16, 1/16, 2/16, 4/16, 2/16, 1/16, 2/16, 1/16];


	// Composer
		var composer = new THREE.EffectComposer( renderer );
		composer.setSize(screenWidth * dpr, screenHeight * dpr);

		composer.addPass(renderPass);
		
		composer.addPass(SSAOpass);
		composer.addPass(FXAApass);
		composer.addPass(CCpass);
		composer.addPass(CCNIXpass);

		// composer.addPass(cvPass);

		composer.addPass(copyPass);



	// Post-Processing GUI

		var guiPP = guiDebug.addFolder('Post-Processing');
		guiPP.open();


		// FXAA
		guiPP.add( FXAApass, 'enabled').name('FXAA');


		// SSAO
		var onlyAO = {value: false};
		var guiSSAO = guiPP.addFolder('SSAO');
		guiSSAO.add( SSAOpass, 'enabled').name('Enable');
		guiSSAO.add( onlyAO, 'value').name('Show RAW').onChange( function(bool) {
			SSAOpass.uniforms[ 'onlyAO' ].value = bool ? 1 : 0;
		});
		guiSSAO.add( SSAOpass.uniforms.aoClamp, 'value', 0.0, 1.0).name('Clamp');
		guiSSAO.add( SSAOpass.uniforms.lumInfluence, 'value', -2.0, 2.0).name('LumInfluence');


		// Bleach Bypass & E6C41
		var guiBleach = guiPP.addFolder('Bleach Bypass & E6C41');
		guiBleach.add( CCNIXpass, 'enabled').name('Enable');
		guiBleach.add( CCNIXpass.uniforms.uOpacity, 'value', 0.0, 2.0, 0.1).name('Bleach Bypass');
		guiBleach.add( CCNIXpass.uniforms.uOpacity2, 'value', 0.0, 2.0, 0.1).name('E6C41');

		
		// Color Correction
		var ccu = CCpass.uniforms;

		var ccuEffect = {
			exposure: 1.0,
			powR: 1.0,
			powG: 1.0,
			powB: 1.0,
			mulR: 1.0,
			mulG: 1.0,
			mulB: 1.0,
		};

		function adjustCC() {
			ccu.mulRGB.value.set(ccuEffect.mulR, ccuEffect.mulG, ccuEffect.mulB);
			ccu.powRGB.value.set(ccuEffect.powR, ccuEffect.powG, ccuEffect.powB);
		}

		var guiCC = guiPP.addFolder('Color Correction');

		guiCC.add( CCpass, 'enabled').name('Enable');

		guiCC.add( ccu.exposure, 'value', 0.0, 5.0, 0.01).name('Exposure');
		guiCC.add( ccuEffect, 'powR', 1.0, 3.0, 0.01).onChange(adjustCC);
		guiCC.add( ccuEffect, 'powG', 1.0, 3.0, 0.01).onChange(adjustCC);
		guiCC.add( ccuEffect, 'powB', 1.0, 3.0, 0.01).onChange(adjustCC);
		guiCC.add( ccuEffect, 'mulR', 1.0, 3.0, 0.01).onChange(adjustCC);
		guiCC.add( ccuEffect, 'mulG', 1.0, 3.0, 0.01).onChange(adjustCC);
		guiCC.add( ccuEffect, 'mulB', 1.0, 3.0, 0.01).onChange(adjustCC);
		adjustCC();