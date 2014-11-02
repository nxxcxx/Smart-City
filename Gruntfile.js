module.exports = function(grunt) {/*jshint strict: false*/

	// Project configuration.
	grunt.initConfig({

		pkg: grunt.file.readJSON('package.json'),

		concat: {
			options: {
				// banner: '/* <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
				banner: '(function main() { "use strict";\n\n',
				footer: '\n\n})();'
			},
			build: {
				src: ['js/main.js', 'js/events.js'],
				dest: 'js/build/smart-city-app.js'
			}
		},

		uglify: {
			options: {
				sourceMap: true
			},
			build: {
				src: ['js/build/smart-city-app.js'],
				dest: 'js/build/smart-city-app.min.js'
			}
		},

		watch: {
			// global opptions for all watcher
			options: {
				livereload: true
			},
			js: {
				files: 'js/*.js',
				tasks: ['concat']
			},
			html: {
				files: '*.html'
			}
		},

	});

	// Load the plugin that provides the tasks.
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// tasks
	grunt.registerTask('default', ['concat']);

};