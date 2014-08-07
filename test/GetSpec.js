/* global describe, it, expect, json, jpath */

describe('get', function() {
  "use strict";

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

  it('should not skip past properties which are not in the path', function() {
    expect(jpath(json).get('/batters/type')).toEqual([]);
    expect(jpath(json).get('//batters/type')).toEqual([]);
  });

  it('should return an empty array if no match can be found', function() {
    expect(jpath(json).get('/foo/bar')).toEqual([]);
  });

  it('should return the original document if no path is submitted', function() {
    expect(jpath(json).get("")).toEqual(json);
  });
});
