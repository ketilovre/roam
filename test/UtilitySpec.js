/* global describe, it, expect, json, roam */

describe('Utilities', function() {
  "use strict";

  describe('count', function() {
    it('should return the number of matching properties', function() {
      expect(roam(json).count('id')).toEqual(3);
      expect(roam(json).count('*id')).toEqual(26);

      expect(roam(json).count('type')).toEqual(3);
      expect(roam(json).count('*type')).toEqual(26);

      expect(roam(json).count('batters.batter')).toEqual(3);
      expect(roam(json).count('batters.batter.id')).toEqual(7);
      expect(roam(json).count('*topping.id')).toEqual(16);
    });
  });

  describe('has', function() {
    it('should return true if a matching property can be found, false otherwise', function() {
      expect(roam(json).has('id')).toBeTrue;
      expect(roam(json).has('type')).toBeTrue;

      expect(roam(json).has('*id')).toBeTrue;
      expect(roam(json).has('*type')).toBeTrue;

      expect(roam(json).has('batter')).toBeFalse;
      expect(roam(json).has('batters')).toBeTrue;
      expect(roam(json).has('*batter')).toBeTrue;

      expect(roam(json).has('things')).toBeFalse;
      expect(roam(json).has('*things')).toBeFalse;

      expect(roam(json).has('*topping.id')).toBeTrue;
      expect(roam(json).has('*toppings')).toBeFalse;
    });
  });

  describe('one', function() {
    it('should return the first matched property', function() {
      expect(roam(json).one('id')).toEqual('0001');
      expect(roam(json).one('*batter.type')).toEqual('Regular');
      expect(roam(json).one('topping.type')).toEqual('None');
      expect(roam(json).one('*name')).toEqual('Cake');
    });
  });

  describe('filter', function() {
    it('should receive standard filter-arguments in the callback', function() {
      var resultArr = roam(json).get('name');
      roam(json).filter('name', function(elem, i, arr) {
        expect(['Cake', 'Raised', 'Old Fashioned']).toContain(elem);
        expect([0,1,2]).toContain(i);
        expect(arr).toEqual(resultArr);
      });
    });

    it('should remove all elements for which the predicate returns false', function() {
      var resultArr = roam(json).filter('name', function(elem) {
        return elem === 'Cake';
      });
      expect(resultArr).toEqual(['Cake']);
    });
  });

  describe('map', function() {
    it('should receive standard map-arguments in the callback', function() {
      var resultArr = roam(json).get('ppu');
      roam(json).map('ppu', function(elem, i, arr) {
        expect(elem).toEqual(0.55);
        expect([0,1,2]).toContain(i);
        expect(arr).toEqual(resultArr);
      });
    });

    it('should apply the callback to each element of the returned array', function() {
      var mapped = roam(json).map('name', function(elem) {
        return elem.toUpperCase();
      });
      expect(mapped).toEqual(['CAKE', 'RAISED', 'OLD FASHIONED']);
    });
  });
});
