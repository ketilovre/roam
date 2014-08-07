/* global describe, it, expect, json, j */

if (typeof require !== 'undefined') {
  json = require('./JsonExample.js'); /* jshint ignore:line */
  j = require('../dist/j.js'); /* jshint ignore:line */
}

describe("j", function() {
  "use strict";

  it("should create a JPath object", function() {
    expect(j(json)).toBeDefined();

    expect(j(json).get).toBeDefined();
    expect(j(json).one).toBeDefined();
    expect(j(json).has).toBeDefined();
    expect(j(json).count).toBeDefined();

  });

  describe('get', function() {

    it('should find and retrieve fields on the root level', function() {
      expect(j(json).get('/id')).toEqual(['0001', '0002', '0003']);
      expect(j(json).get('/name')).toEqual(['Cake', 'Raised', 'Old Fashioned']);
    });

    it('should find and retrieve fields via nested sequential paths', function() {
      expect(j(json).get('/batters/batter/id')).toEqual(['1001', '1002', '1003', '1004', '1001', '1001', '1002']);
      expect(j(json).get('/batters/batter/type')).toEqual(
        ['Regular', 'Chocolate', 'Blueberry', 'Devil\'s Food', 'Regular', 'Regular', 'Chocolate']
      );
    });

    it('should find and retrieve fields via global paths', function() {
      expect(j(json).get('//batter/type')).toEqual(j(json).get('/batters//type'));
      expect(j(json).get('//batter/id')).toEqual(j(json).get('/batters//id'));

      expect(j(json).get('//id')).toEqual(['0001', '1001', '1002', '1003', '1004', '5001', '5002',
      '5005', '5007', '5006', '5003', '5004', '0002', '1001', '5001', '5002', '5005', '5003',
      '5004', '0003', '1001', '1002', '5001', '5002', '5003', '5004']);
      expect(j(json).get('//type')).toEqual([ 'donut', 'Regular', 'Chocolate', 'Blueberry', 'Devil\'s Food', 'None',
      'Glazed', 'Sugar', 'Powdered Sugar', 'Chocolate with Sprinkles', 'Chocolate', 'Maple', 'donut', 'Regular', 'None',
      'Glazed', 'Sugar', 'Chocolate', 'Maple', 'donut', 'Regular', 'Chocolate', 'None', 'Glazed', 'Chocolate', 'Maple' ]);
    });

    it('should return an empty array if no match can be found', function() {
      expect(j(json).get('/foo/bar')).toEqual([]);
    });

    it('should return the original document if no path is submitted', function() {
      expect(j(json).get("")).toEqual(json);
    });
  });

  describe('count', function() {
    it('should return the number of matching properties', function() {
      expect(j(json).count('/id')).toEqual(3);
      expect(j(json).count('//id')).toEqual(26);

      expect(j(json).count('/type')).toEqual(3);
      expect(j(json).count('//type')).toEqual(26);

      expect(j(json).count('/batters/batter')).toEqual(3);
      expect(j(json).count('/batters/batter/id')).toEqual(7);
      expect(j(json).count('//topping/id')).toEqual(16);
    });
  });

  describe('has', function() {
    it('should return true if a matching property can be found, false otherwise', function() {
      expect(j(json).has('/id')).toBeTrue;
      expect(j(json).has('/type')).toBeTrue;

      expect(j(json).has('//id')).toBeTrue;
      expect(j(json).has('//type')).toBeTrue;

      expect(j(json).has('/batter')).toBeFalse;
      expect(j(json).has('/batters')).toBeTrue;
      expect(j(json).has('//batter')).toBeTrue;

      expect(j(json).has('/things')).toBeFalse;
      expect(j(json).has('//things')).toBeFalse;

      expect(j(json).has('//topping/id')).toBeTrue;
      expect(j(json).has('//toppings')).toBeFalse;
    });
  });

  describe('one', function() {
    it('should return the first matched property', function() {
      expect(j(json).one('/id')).toEqual('0001');
      expect(j(json).one('//batter/type')).toEqual('Regular');
      expect(j(json).one('/topping/type')).toEqual('None');
      expect(j(json).one('//name')).toEqual('Cake');
    });
  });
});
