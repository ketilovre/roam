/* global describe, it, expect, json, jpath */

if (typeof require !== 'undefined') {
  json = require('./JsonExample.js'); /* jshint ignore:line */
  jpath = require('../dist/jpath.js'); /* jshint ignore:line */
}

describe("JPath", function() {
  "use strict";

  it("should create a JPath object", function() {
    expect(jpath(json)).toBeDefined();

    expect(jpath(json).get).toBeDefined();
    expect(jpath(json).map).toBeDefined();
    expect(jpath(json).one).toBeDefined();
    expect(jpath(json).has).toBeDefined();
    expect(jpath(json).count).toBeDefined();

  });
});
