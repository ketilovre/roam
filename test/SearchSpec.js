/* global describe, it, it, expect, json, roam */

describe('search', function() {
  "use strict";

  describe('get', function() {
    it('should find and retrieve fields on the root level', function() {
      expect(roam(json).get('id')).toEqual(['0001', '0002', '0003']);
      expect(roam(json).get('name')).toEqual(['Cake', 'Raised', 'Old Fashioned']);
    });

    it('should find and retrieve fields via nested sequential paths', function() {
      expect(roam(json).get('batters.batter.id')).toEqual(['1001', '1002', '1003', '1004', '1001', '1001', '1002']);
      expect(roam(json).get('batters.batter.type')).toEqual(
        ['Regular', 'Chocolate', 'Blueberry', 'Devil\'s Food', 'Regular', 'Regular', 'Chocolate']
      );
    });

    it('should find and retrieve fields via global paths', function() {
      expect(roam(json).get('*batter.type')).toEqual(roam(json).get('batters.*type'));
      expect(roam(json).get('*batter.id')).toEqual(roam(json).get('batters.*id'));

      expect(roam(json).get('*id')).toEqual(['0001', '1001', '1002', '1003', '1004', '5001', '5002',
      '5005', '5007', '5006', '5003', '5004', '0002', '1001', '5001', '5002', '5005', '5003',
      '5004', '0003', '1001', '1002', '5001', '5002', '5003', '5004']);
      expect(roam(json).get('*type')).toEqual([ 'donut', 'Regular', 'Chocolate', 'Blueberry', 'Devil\'s Food', 'None',
      'Glazed', 'Sugar', 'Powdered Sugar', 'Chocolate with Sprinkles', 'Chocolate', 'Maple', 'donut', 'Regular', 'None',
      'Glazed', 'Sugar', 'Chocolate', 'Maple', 'donut', 'Regular', 'Chocolate', 'None', 'Glazed', 'Chocolate', 'Maple' ]);
    });

    it('should not skip past properties which are not in the path', function() {
      expect(roam(json).get('batters.type')).toEqual([]);
      expect(roam(json).get('*batters.type')).toEqual([]);
    });

    it('should return an empty array if no match can be found', function() {
      expect(roam(json).get('foo.bar')).toEqual([]);
    });

    it('should return the original document if no path is submitted', function() {
      expect(roam(json).get("")).toEqual(json);
    });

    it('should be behave the same, regardless of whether the base item is an array or object', function() {
      var fromObj = roam(json[0]).get('sauces.sauce');
      var fromObjRecursive = roam(json[0]).get('*sauce');

      var fromArr = roam(json).get('sauces.sauce');
      var fromArrRecursive = roam(json).get('*sauce');

      expect(fromObj).toEqual(fromObjRecursive);
      expect(fromObjRecursive).toEqual(fromArr);
      expect(fromArr).toEqual(fromArrRecursive);
    });

    it('should allow users to specify array indexes to return', function() {
      expect(roam(json).get('0')).toEqual([json[0]]);

      var toppings = [{id: '5007', type: 'Powdered Sugar'}, {id: '5003', type: 'Chocolate' }, {id: '5004', type: 'Maple'}];
      expect(roam(json).get('topping.3')).toEqual(toppings);

      var batters = [{"id": "1003", "type": "Blueberry"}];
      expect(roam(json).get('batters.batter.2')).toEqual(batters);
      expect(roam(json).get('*batter.2')).toEqual(batters);
    });

    it('should get nulls, boolean false and other falsy values', function() {
      expect(roam(json).get('recipe')).toEqual([null, false, 0]);
      expect(roam(json).get('*recipe')).toEqual([null, false, 0]);

      expect(roam(json).get('frosting')).toEqual(["", "Vanilla", "Chocolate"]);
      expect(roam(json).get('*frosting')).toEqual(["", "Vanilla", "Chocolate"]);
    });
  });

  describe('one', function() {
    it('should return the first matched property', function() {
      expect(roam(json).one('id')).toEqual('0001');
      expect(roam(json).one('*batter.type')).toEqual('Regular');
      expect(roam(json).one('topping.type')).toEqual('None');
      expect(roam(json).one('*name')).toEqual('Cake');
    });

    it('should return undefined in a matching value cannot be found', function() {
      expect(roam(json).one('foo')).toBeUndefined();
      expect(roam(json).one('*bar')).toBeUndefined();
      expect(roam(json).one('*batter.things')).toBeUndefined();
      expect(roam(json).one('topping.stuff')).toBeUndefined();
    });
  });

});
