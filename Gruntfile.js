
module.exports = function(grunt) {/*jshint strict: false*/

	// Project configuration.
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		concat: {
			options: {
				// banner: '/* <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
				// banner: '(function main() { "use strict";\n\n',
				banner: '"use strict";',
				// footer: '\n\n})();'
			},
			build: {
				src: [
						'js/extends.js', 'js/init.js', 'js/light.js','js/postprocessing.js',
						'js/assetManager.js', 'js/loadingManager.js', 'js/render.js', 
						'js/world.js', 'js/animation.js', 'js/sky.js', 'js/ocean.js', 'js/lensflare.js', 'js/events.js'
				],

				dest: 'build/smart-city-app.js'
			}
		},

		uglify: {
			options: {
				sourceMap: true
			},
			build: {
				src: ['build/smart-city-app.js'],
				dest: 'build/smart-city-app.min.js'
			}
		},

		watch: {
			// global opptions for all watcher
			options: {
				livereload: true
			},
			js: {
				files: ['js/**', '*.js'],
				tasks: ['concat']
			},
			html: {
				files: '*.html'
			},
			css: {
				files: 'css/*.css'
			}
		},

	});

	// Load the plugin that provides the tasks.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// tasks
	grunt.registerTask('default', ['watch']);
	grunt.registerTask('build', ['concat', 'uglify']);

};