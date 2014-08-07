/* global module:false */

module.exports = function(grunt) {
  "use strict";

  require('time-grunt')(grunt);

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-jasmine-node');

  grunt.registerTask('test', ['jshint', 'karma:unit']);
  grunt.registerTask('build', ['uglify', 'jshint', 'karma:unit', 'karma:minified', 'jasmine_node']);
  grunt.registerTask('ci', ['jshint', 'karma', 'jasmine_node']);
  grunt.registerTask('default', 'build');

  var customLaunchers = {
    sl_chrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 7',
      version: '35'
    },
    sl_firefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
      version: '30'
    },
    sl_ios_safari: {
      base: 'SauceLabs',
      browserName: 'iphone',
      platform: 'OS X 10.9',
      version: '7.1'
    },
    sl_ie_11: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 8.1',
      version: '11'
    }
  };

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
          'dist/j.min.js': ['src/jpath.js', 'src/**/*.js', '!src/export.js', 'src/export.js']
        }
      },
      concat: {
        options: {
          mangle: false,
          compress:false
        },
        files: {
          'dist/j.js': ['src/jpath.js', 'src/**/*.js', '!src/export.js', 'src/export.js']
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
          'karma-phantomjs-launcher',
          'karma-chrome-launcher',
          'karma-firefox-launcher'
        ]
      },
      unit: {
        options: {
          files: [
            'node_modules/lodash/dist/lodash.min.js',
            'test/BrowserHelper.js',
            'src/jpath.js',
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
            'node_modules/lodash/dist/lodash.min.js',
            'dist/j.min.js',
            'test/**/*.js'
          ],
          exclude: [
            'test/BrowserHelper.js'
          ],
          reporters: ['dots'],
          browsers: ['PhantomJS'],
          port: 9877
        }
      },
      sauce: {
        options: {
          files: [
            'node_modules/lodash/dist/lodash.min.js',
            'dist/j.min.js',
            'test/**/*.js'
          ],
          exclude: [
            'test/BrowserHelper.js'
          ],
          sauceLabs: {
            testName: 'j browser tests'
          },
          customLaunchers: customLaunchers,
          browsers: Object.keys(customLaunchers),
          reporters: ['dots', 'saucelabs'],
          port: 9878
        }
      }
    }

  });
};
