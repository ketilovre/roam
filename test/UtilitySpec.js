/* global describe, it, expect, json, jpath */

describe('Utilities', function() {
  "use strict";

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

  describe('map', function() {
    it('should receive each element in the array as an argument to the callback', function() {
      jpath(json).map('/ppu', function(elem) {
        expect(elem).toEqual(0.55);
      });
    });

    it('should apply the callback to each element of the returned array', function() {
      var mapped = jpath(json).map('/name', function(elem) {
        return elem.toUpperCase();
      });
      expect(mapped).toEqual(['CAKE', 'RAISED', 'OLD FASHIONED']);
    });
  });
});
