/* global describe, it, expect, json, roam */

if (typeof require !== 'undefined') {
  json = require('./JsonExample.js'); /* jshint ignore:line */
  roam = require('../dist/roam.js'); /* jshint ignore:line */
}

describe("roam", function() {
  "use strict";

  it("should create a Roam object", function() {
    expect(roam(json)).toBeDefined();

    expect(roam(json).get).toBeDefined();
    expect(roam(json).map).toBeDefined();
    expect(roam(json).one).toBeDefined();
    expect(roam(json).has).toBeDefined();
    expect(roam(json).count).toBeDefined();

  });
});
