/* global module:false */

module.exports = function(grunt) {
  "use strict";

  require('time-grunt')(grunt);

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-release');

  grunt.registerTask('test', ['jshint', 'karma:unit']);
  grunt.registerTask('build', ['uglify', 'jshint', 'karma', 'jasmine_node']);
  grunt.registerTask('ci', ['jshint', 'karma', 'jasmine_node']);
  grunt.registerTask('default', 'build');

  grunt.initConfig({

    watch: {
      test: {
        files: 'test/**/*.js',
        tasks: 'test'
      },
      jpath: {
        files: 'src/**/*.js',
        tasks: 'uglify'
      }
    },

    uglify: {
      options: {
        wrap: 'jpath'
      },
      min: {
        options: {
          mangle: true,
          compress: true
        },
        files: {
          'dist/roam.min.js': ['src/roam.js', 'src/**/*.js', '!src/export.js', 'src/export.js']
        }
      },
      concat: {
        options: {
          mangle: false,
          compress:false,
          beautify: true,
          preserveComments: 'some'
        },
        files: {
          'dist/roam.js': ['src/roam.js', 'src/**/*.js', '!src/export.js', 'src/export.js']
        }
      }
    },

    jshint: {
      options: {
        jshintrc: true
      },
      all: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js']
    },

    jasmine_node: {
      options: {
        forceExit: true,
        specNameMatcher: 'Spec'
      },
      all: ['test/']
    },

    karma: {
      options: {
        basePath: '',
        frameworks: ['jasmine'],
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
            'test/BrowserHelper.js',
            'src/roam.js',
            'src/**/*.js',
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
          browsers: ['PhantomJS'],
          port: 9876
        }
      },
      minified: {
        options: {
          files: [
            'dist/roam.min.js',
            'test/**/*.js'
          ],
          exclude: [
            'test/BrowserHelper.js'
          ],
          reporters: ['dots'],
          browsers: ['PhantomJS'],
          port: 9877
        }
      }
    }

  });
};
