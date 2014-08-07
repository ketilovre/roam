/* global describe, it, expect, json, jpath */

describe('map', function() {
  "use strict";

  it('should find and modify values in-place, and return the whole object', function() {
    var j = jpath(json);
    var oldTypes = j.get('//batter/type');
    var fooTypes = oldTypes.map(function() {
      return 'foo';
    });

    var mapped = j.map('//batter/type', function() {
      return 'foo';
    });

    var newTypes = jpath(mapped).get('//batter/type');

    expect(newTypes).toEqual(fooTypes);
  });

  it('should return the original object unchanged if no callback is passed', function() {
    expect(jpath(json).map()).toEqual(json);
    expect(jpath(json).map('')).toEqual(json);
    expect(jpath(json).map('//id')).toEqual(json);
    expect(jpath(json).map('//toppings/id')).toEqual(json);
  });

  it('should generate the same result with different, but equivalent, paths', function() {
    var control = jpath(json).map('//batter/type');
    expect(jpath(json).map('/batters/batter/type')).toEqual(control);
  });

  it('should not arbitrarily skip past items which are not in the path', function() {
    var unchanged = jpath(json).map('//batters/type', function() { //Skips the 'batter'-prop
      return 'foo';
    });
    expect(JSON.stringify(json)).toEqual(JSON.stringify(unchanged));
  });
});
