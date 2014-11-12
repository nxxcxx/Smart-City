
// ---- Post-Processing

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
	// SSAOpass.uniforms[ 'aoClamp' ].value = 0.5;
	// SSAOpass.uniforms[ 'lumInfluence' ].value = 0.5;
	SSAOpass.uniforms[ 'onlyAO' ].value = 0;	// debug
	

	// FXAA

	var FXAApass = new THREE.ShaderPass( THREE.FXAAShader );
	FXAApass.uniforms['resolution'].value.set(1 / (screenWidth * dpr), 1 / (screenHeight * dpr));

	var renderPass = new THREE.RenderPass( scene, camera );

	var CCpass = new THREE.ShaderPass( THREE.ColorCorrectionShader );

	var copyPass = new THREE.ShaderPass( THREE.CopyShader );
	copyPass.renderToScreen = true;


	var cvPass = new THREE.ShaderPass( THREE.ConvolutionShader );
	cvPass.uniforms['cKernel'].value = [1/16, 2/16, 1/16, 2/16, 4/16, 2/16, 1/16, 2/16, 1/16];


	var CCNIXpass = new THREE.ShaderPass( THREE.ColorCorrectionShaderNIX );


	var composer = new THREE.EffectComposer( renderer );
	composer.setSize(screenWidth * dpr, screenHeight * dpr);

	composer.addPass(renderPass);
	composer.addPass(SSAOpass);
	composer.addPass(FXAApass);
	composer.addPass(CCpass);
	composer.addPass(CCNIXpass);

	// test convolution gaussian blur
	// composer.addPass(cvPass);

	composer.addPass(copyPass);

	var guiPP = guiDebug.addFolder('Post-Processing');
	guiPP.open();

	guiPP.add( SSAOpass, 'enabled').name('SSAO');
	guiPP.add( FXAApass, 'enabled').name('FXAA');
	
	guiBleach = guiPP.addFolder('Bleach Bypass & E6C41');
	guiBleach.add( CCNIXpass, 'enabled').name('Enable');
	guiBleach.add( CCNIXpass.uniforms.uOpacity, 'value', 0.0, 2.0, 0.1).name('Bleach Bypass');
	guiBleach.add( CCNIXpass.uniforms.uOpacity2, 'value', 0.0, 2.0, 0.1).name('E6C41');

	
	var ccu = CCpass.uniforms;

	var ccuEffect = {
		powR: 1.15,
		powG: 1.15,
		powB: 1.1,
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

	guiCC.add( ccuEffect, 'powR', 1.0, 3.0, 0.01).onChange(adjustCC);
	guiCC.add( ccuEffect, 'powG', 1.0, 3.0, 0.01).onChange(adjustCC);
	guiCC.add( ccuEffect, 'powB', 1.0, 3.0, 0.01).onChange(adjustCC);
	guiCC.add( ccuEffect, 'mulR', 1.0, 3.0, 0.01).onChange(adjustCC);
	guiCC.add( ccuEffect, 'mulG', 1.0, 3.0, 0.01).onChange(adjustCC);
	guiCC.add( ccuEffect, 'mulB', 1.0, 3.0, 0.01).onChange(adjustCC);
	adjustCC();