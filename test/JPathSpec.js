/* global describe, it, expect, json, jpath */

if (typeof require !== 'undefined') {
  json = require('./JsonExample.js'); /* jshint ignore:line */
  jpath = require('../dist/jpath.js'); /* jshint ignore:line */
}

describe("j", function() {
  "use strict";

  it("should create a JPath object", function() {
    expect(jpath(json)).toBeDefined();

    expect(jpath(json).get).toBeDefined();
    expect(jpath(json).one).toBeDefined();
    expect(jpath(json).has).toBeDefined();
    expect(jpath(json).count).toBeDefined();

  });

  describe('get', function() {

    it('should find and retrieve fields on the root level', function() {
      expect(jpath(json).get('/id')).toEqual(['0001', '0002', '0003']);
      expect(jpath(json).get('/name')).toEqual(['Cake', 'Raised', 'Old Fashioned']);
    });

    it('should find and retrieve fields via nested sequential paths', function() {
      expect(jpath(json).get('/batters/batter/id')).toEqual(['1001', '1002', '1003', '1004', '1001', '1001', '1002']);
      expect(jpath(json).get('/batters/batter/type')).toEqual(
        ['Regular', 'Chocolate', 'Blueberry', 'Devil\'s Food', 'Regular', 'Regular', 'Chocolate']
      );
    });

    it('should find and retrieve fields via global paths', function() {
      expect(jpath(json).get('//batter/type')).toEqual(jpath(json).get('/batters//type'));
      expect(jpath(json).get('//batter/id')).toEqual(jpath(json).get('/batters//id'));

      expect(jpath(json).get('//id')).toEqual(['0001', '1001', '1002', '1003', '1004', '5001', '5002',
      '5005', '5007', '5006', '5003', '5004', '0002', '1001', '5001', '5002', '5005', '5003',
      '5004', '0003', '1001', '1002', '5001', '5002', '5003', '5004']);
      expect(jpath(json).get('//type')).toEqual([ 'donut', 'Regular', 'Chocolate', 'Blueberry', 'Devil\'s Food', 'None',
      'Glazed', 'Sugar', 'Powdered Sugar', 'Chocolate with Sprinkles', 'Chocolate', 'Maple', 'donut', 'Regular', 'None',
      'Glazed', 'Sugar', 'Chocolate', 'Maple', 'donut', 'Regular', 'Chocolate', 'None', 'Glazed', 'Chocolate', 'Maple' ]);
    });

    it('should return an empty array if no match can be found', function() {
      expect(jpath(json).get('/foo/bar')).toEqual([]);
    });

    it('should return the original document if no path is submitted', function() {
      expect(jpath(json).get("")).toEqual(json);
    });
  });

  describe('count', function() {
    it('should return the number of matching properties', function() {
      expect(jpath(json).count('/id')).toEqual(3);
      expect(jpath(json).count('//id')).toEqual(26);

      expect(jpath(json).count('/type')).toEqual(3);
      expect(jpath(json).count('//type')).toEqual(26);

      expect(jpath(json).count('/batters/batter')).toEqual(3);
      expect(jpath(json).count('/batters/batter/id')).toEqual(7);
      expect(jpath(json).count('//topping/id')).toEqual(16);
    });
  });

  describe('has', function() {
    it('should return true if a matching property can be found, false otherwise', function() {
      expect(jpath(json).has('/id')).toBeTrue;
      expect(jpath(json).has('/type')).toBeTrue;

      expect(jpath(json).has('//id')).toBeTrue;
      expect(jpath(json).has('//type')).toBeTrue;

      expect(jpath(json).has('/batter')).toBeFalse;
      expect(jpath(json).has('/batters')).toBeTrue;
      expect(jpath(json).has('//batter')).toBeTrue;

      expect(jpath(json).has('/things')).toBeFalse;
      expect(jpath(json).has('//things')).toBeFalse;

      expect(jpath(json).has('//topping/id')).toBeTrue;
      expect(jpath(json).has('//toppings')).toBeFalse;
    });
  });

  describe('one', function() {
    it('should return the first matched property', function() {
      expect(jpath(json).one('/id')).toEqual('0001');
      expect(jpath(json).one('//batter/type')).toEqual('Regular');
      expect(jpath(json).one('/topping/type')).toEqual('None');
      expect(jpath(json).one('//name')).toEqual('Cake');
    });
  });
});
