
THREE.ColorCorrectionShader = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"powRGB":   { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) },
		"mulRGB":   { type: "v3", value: new THREE.Vector3( 1, 1, 1 ) }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join("\n"),

	fragmentShader: [

		"uniform sampler2D tDiffuse;",
		"uniform vec3 powRGB;",
		"uniform vec3 mulRGB;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 color = texture2D( tDiffuse, vUv );",
			"color.rgb = mulRGB * pow( color.rgb, powRGB );",
			// "color.rgb = sqrt(color.rgb);",
			"gl_FragColor.rgb = color.rgb;",


		"}"

	].join("\n")

};