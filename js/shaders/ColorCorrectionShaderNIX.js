
THREE.ColorCorrectionShaderNIX = {

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"uOpacity": {type: "f", value: 0.1},
		"uOpacity2": {type: "f", value: 0.3}

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

		"uniform float uOpacity;",
		"uniform float uOpacity2;",

		"varying vec2 vUv;",

		"void main() {",

			"vec4 texel = texture2D( tDiffuse, vUv );",

			"vec3 color = vec3(0.0);",

			// RGB to luma conversion 0.299, 0.587, 0.114
			// alpha composite: co = c1*a1 + c2*a2 * (1.0 - a1)

			// bleach bypass
				"float luma = dot(texel.rgb, vec3(0.299, 0.587, 0.114));",

				"vec3 luminosity = vec3(luma);",

				"if (luma > 0.5) {",

					"color = 1.0 - 2.0 * (1.0 - texel.rgb) * (1.0 - luminosity);",

				"} else {",

					"color = 2.0 * texel.rgb * luminosity;",

				"}",

				"float a1 = uOpacity;",

				"color = color*a1 + texel.rgb * texel.a * (1.0 - a1);",

			// E6C41 cross processing

				"vec3 newColor = color;",

				"newColor.r = smoothstep(0.3, 0.9, newColor.r);",
				"newColor.g = smoothstep(0.0, 0.9, newColor.g);",
				"newColor.b = smoothstep(-0.2, 1.1, newColor.b);",

				

				"float a11 = uOpacity2;",

				"color = newColor*a11 + color.rgb * 1.0 * (1.0 - a11);",



			"gl_FragColor = vec4(color, texel.a);",

		"}"

	].join("\n")

};
