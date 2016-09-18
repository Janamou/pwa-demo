'use strict';

var packageJson = require('./package.json');
var path = require('path');
var swPrecache = require('./node_modules/sw-precache/lib/sw-precache.js');

module.exports = function(grunt) {
  grunt.initConfig({
    swPrecache: {
      dev: {
        handleFetch: true,
        rootDir: 'app'
      }
    }
  });

  function writeServiceWorkerFile(rootDir, handleFetch, callback) {
    var config = {
      cacheId: packageJson.name,
      // If handleFetch is false (i.e. because this is called from swPrecache:dev), then
      // the service worker will precache resources but won't actually serve them.
      // This allows you to test precaching behavior without worry about the cache preventing your
      // local changes from being picked up during the development cycle.
      handleFetch: handleFetch,
      logger: grunt.log.writeln,
      staticFileGlobs: [
        rootDir + '/css/**.css',
        rootDir + '/**.html',
        rootDir + '/images/**.*',
        rootDir + '/js/**.js'
      ],
      stripPrefix: rootDir + '/',
      // verbose defaults to false, but for the purposes of this demo, log more.
      verbose: true
    };

    swPrecache.write(path.join(rootDir, 'service-worker.js'), config, callback);
  }

  grunt.registerMultiTask('swPrecache', function() {
    var done = this.async();
    var rootDir = this.data.rootDir;
    var handleFetch = this.data.handleFetch;

    writeServiceWorkerFile(rootDir, handleFetch, function(error) {
      if (error) {
        grunt.fail.warn(error);
      }
      done();
    });
  });
};