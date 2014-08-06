/* global module:false */

module.exports = function(grunt) {
  "use strict";

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');

  grunt.registerTask('test', ['jshint', 'karma:unit']);
  grunt.registerTask('build', ['test', 'uglify', 'karma:minified']);

  grunt.initConfig({

    watch: {
      test: {
        files: 'test/**/*.js',
        tasks: 'test'
      }
    },

    uglify: {
      options: {
        wrap: 'j'
      },
      min: {
        options: {
          mangle: true,
          compress: true
        },
        files: {
          'dist/j.min.js': ['src/jpath.js', 'src/**/*.js']
        }
      },
      concat: {
        options: {
          mangle: false,
          compress: false,
          beautify: true,
          preserveComments: true
        },
        files: {
          'dist/j.js': ['src/jpath.js', 'src/**/*.js']
        }
      }
    },

    jshint: {
      options: {
        jshintrc: true
      },
      all: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js']
    },

    karma: {
      options: {
        basePath: '',
        frameworks: ['jasmine'],
        exclude: [
          'src/export.js'
        ],
        port: 9876,
        colors: true,
        autoWatch: false,
        captureTimeout: 60000,
        singleRun: true,
        plugins: [
          'karma-jasmine',
          'karma-coverage',
          'karma-phantomjs-launcher'
        ]
      },
      unit: {
        options: {
          files: [
            'node_modules/lodash/dist/lodash.min.js',
            'src/**/*.js',
            'test/TestHelper.js',
            'test/**/*.js'
          ],
          reporters: ['dots', 'coverage'],
          preprocessors: {
            'src/**/*.js': 'coverage'
          },
          coverageReporter: {
            type: "lcov",
            dir: "coverage"
          },
          browsers: ['PhantomJS']
        }
      },
      minified: {
        options: {
          files: [
            'node_modules/lodash/dist/lodash.min.js',
            'dist/j.min.js',
            'test/**/*.js'
          ],
          exclude: [
            'test/TestHelper.js'
          ],
          reporters: ['dots'],
          browsers: ['PhantomJS']
        }
      }
    }

  });
};
