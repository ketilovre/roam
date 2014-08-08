/* global describe, it, expect, json, jpath */

describe('transform', function() {
  "use strict";

  it('should find and modify values in-place, and return the whole object', function() {
    var j = jpath(json);
    var oldTypes = j.get('//batter/type');
    var fooTypes = oldTypes.map(function() {
      return 'foo';
    });

    var mapped = j.transform('//batter/type', function() {
      return 'foo';
    });

    var newTypes = jpath(mapped).get('//batter/type');

    expect(newTypes).toEqual(fooTypes);
  });

  it('should return the original object unchanged if no callback is passed', function() {
    expect(jpath(json).transform()).toEqual(json);
    expect(jpath(json).transform('')).toEqual(json);
    expect(jpath(json).transform('//id')).toEqual(json);
    expect(jpath(json).transform('//toppings/id')).toEqual(json);
  });

  it('should generate the same result with different, but equivalent, paths', function() {
    var control = jpath(json).transform('//batter/type', function(val) {
      return val.toUpperCase();
    });
    expect(jpath(json).transform('/batters/batter/type', function(val) {
      return val.toUpperCase();
    })).toEqual(control);
  });

  it('should not arbitrarily skip past items which are not in the path', function() {
    var unchanged = jpath(json).transform('//batters/type', function() { //Skips the 'batter'-prop, changes nothing.
      return 'foo';
    });
    expect(json).toEqual(unchanged);
  });
});
