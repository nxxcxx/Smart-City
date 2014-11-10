
// ---- Post-Processing

	var depthTarget = new THREE.WebGLRenderTarget( 512, 512, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat } );
			
	var SSAOpass = new THREE.ShaderPass( THREE.SSAOShader );
	SSAOpass.uniforms[ 'tDepth' ].value = depthTarget;
	SSAOpass.uniforms[ 'size' ].value.set( 512, 512 );
	SSAOpass.uniforms[ 'cameraNear' ].value = camera.near;
	SSAOpass.uniforms[ 'cameraFar' ].value = camera.far;
	SSAOpass.uniforms[ 'onlyAO' ].value = 0;	// debug
	SSAOpass.uniforms[ 'lumInfluence' ].value = 0.5;


	var FXAApass = new THREE.ShaderPass( THREE.FXAAShader );
	FXAApass.uniforms['resolution'].value.set(1 / (screenWidth * dpr), 1 / (screenHeight * dpr));

	var renderPass = new THREE.RenderPass( scene, camera );

	var CCpass = new THREE.ShaderPass( THREE.ColorCorrectionShader );

	var copyPass = new THREE.ShaderPass( THREE.CopyShader );
	copyPass.renderToScreen = true;

	var composer = new THREE.EffectComposer( renderer );
	composer.setSize(screenWidth * dpr, screenHeight * dpr);

	composer.addPass(renderPass);
	composer.addPass(SSAOpass);

	composer.addPass(FXAApass);
	composer.addPass(FXAApass);
	
	composer.addPass(CCpass);
	composer.addPass(copyPass);

	SSAOpass.enabled = false;

	var guiPP = guiDebug.addFolder('Post-Processing');
	guiPP.add( SSAOpass, 'enabled').name('SSAO');
	guiPP.add( FXAApass, 'enabled').name('FXAA');
	guiPP.add( CCpass, 'enabled').name('Color Correction');


	var ccu = CCpass.uniforms;

	var ccuEffect = {
		powR: 1.5,
		powG: 1.2,
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
	guiCC.add( ccuEffect, 'powR', 1.0, 3.0, 0.01).onChange(adjustCC);
	guiCC.add( ccuEffect, 'powG', 1.0, 3.0, 0.01).onChange(adjustCC);
	guiCC.add( ccuEffect, 'powB', 1.0, 3.0, 0.01).onChange(adjustCC);
	guiCC.add( ccuEffect, 'mulR', 1.0, 3.0, 0.01).onChange(adjustCC);
	guiCC.add( ccuEffect, 'mulG', 1.0, 3.0, 0.01).onChange(adjustCC);
	guiCC.add( ccuEffect, 'mulB', 1.0, 3.0, 0.01).onChange(adjustCC);
	adjustCC();