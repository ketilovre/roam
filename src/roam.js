/* global define */

;(function (root, factory) {
  "use strict";

  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module !== 'undefined' && typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.roam = factory();
  }

}(this, function () {
  "use strict";

  /**
   * Splits a path into segments. Paths are expected to be period-separated, and each segment may be prefixed with a
   * `*`, in which case it is to be interpreted as a deep query.
   *
   * @function parseSegments
   * @private
   * @param  {String}   path     A period-separated property path.
   * @return {Object[]}          An array of path segments.
   */
  function parseSegments(path) {
    var isRecursive, index = -1, result = [];

    if (!path) {
      return [];
    }

    var segments = path.split('.');

    while (++index < segments.length) {

      isRecursive = segments[index].charAt(0) === '*';

      result.push({
        type: isRecursive ? 'deep' : 'shallow',
        identifier: isRecursive ? segments[index].slice(1) : segments[index]
      });

    }

    return result;
  }



  /**
   * Finds matching properties or array indexes on the next immediate object level. If the current segment identifier
   * is a property name, and the next immediate object level is an array containing objects, it will enter the array
   * and search those objects for matches. If the current segment identifier is an array index, it will match on that
   * instead. If the exitEarly parameter is truthy, it will attempt to exit as soon as possible after a match has
   * been found.
   *
   * @function shallowSearch
   * @private
   * @param   {String}        identifier  The current segment identifier to match. Can be a property name or array index.
   * @param   {Object|Array}  value       The next immediate object level to search in.
   * @param   {Boolean}       exitEarly   Value indicating whether or not to exit once a match has been found.
   * @return  {Array}                     An array of matched values.
   */
  function shallowSearch(identifier, value, exitEarly) {
    var current, memory = [];

    if (!(value instanceof Array) && value.hasOwnProperty(identifier)) {
      memory.push(value[identifier]);
    } else {

      outer:
      for (var i = 0, l = value.length; i < l; i++) {

        current = value[i];

        if (current.hasOwnProperty(identifier)) {
          memory.push(current[identifier]);
        } else if (current instanceof Array) {

          for (var j = 0, m = current.length; j < m; j++) {
            if (current[j].hasOwnProperty(identifier)) {
              memory.push(current[j][identifier]);
              if (exitEarly) {
                break outer;
              }
            }
          }
        } else if (+identifier === i) {
          memory.push(current);
        }
        if (exitEarly && memory.length) {
          break;
        }
      }
    }

    return memory;
  }



  /**
   * Finds matching object properties at any nesting depth. Will only stop traversing a branch of the document if it
   * reaches the end or finds a match. Uses an inner loop to push data to a shared array. If the exitEarly-parameter is
   * truthy, it will attempt to exit as soon as possible after finding a match.
   *
   * @function deepSearch
   * @private
   * @param   {String}        identifier  The current property name to match.
   * @param   {Object|Array}  value       The object to search in.
   * @param   {Boolean}       exitEarly   Value indicating whether or not to exit once a match has been found.
   * @return  {Array}                     An array of matched values.
   */
  function deepSearch(identifier, value, exitEarly) {
    var memory = [];

    function innerLoop(json) {
      if (!exitEarly || !memory.length) {
        if (json instanceof Array) {
          for (var i = 0, l = json.length; i < l; i++) {
            innerLoop(json[i]);
          }
        } else if (json !== null && typeof json === 'object') {
          if (json.hasOwnProperty(identifier)) {
            memory.push(json[identifier]);
          }
          for (var prop in json) {
            if (prop !== identifier && json[prop] !== null && typeof json[prop] === 'object') {
              innerLoop(json[prop]);
            }
          }
        }
      }
    }

    innerLoop(value);
    return memory;
  }



  /**
   * Loops through the segments, delegating the actual document traversal to either shallowSearch or deepSearch
   * depending on the segment type. The result set from the previous segment is passed as the base for the new
   * segment.
   *
   * @function search
   * @private
   * @param  {Object[]} segments  An array of path segments, from parseSegments().
   * @param  {Object}   json      The JSON object to query.
   * @param  {Boolean}  exitEarly Value indicating whether or not to exit once a match has been found.
   * @return {Array}              An array of matched values.
   */
  function search(segments, json, exitEarly) {
    var result, segment,
    memory = json;

    while (segments.length) {

      segment = segments.shift();

      result = [];

      if (segment.type === 'shallow') {
        result = shallowSearch(segment.identifier, memory, exitEarly);
      } else {
        if (memory instanceof Array) {
          for (var i = 0, l = memory.length; i < l; i++) {
            result = result.concat(deepSearch(segment.identifier, memory[i], exitEarly));
          }
        } else if (memory !== null && typeof memory === 'object') {
          for (var prop in memory) {
            if (memory.hasOwnProperty(prop)) {
              result = result.concat(deepSearch(segment.identifier, memory[prop], exitEarly));
            }
          }
        }
      }

      memory = result;
    }

    return memory;
  }



  /**
   * Decides what to do with a given value, considering the remaining segments and the position of the value in the
   * object. If the key matches the last segment in the query, it will apply the callback and return. If there are
   * more segments to go, and the value is traversible, it will delegate back to transformLoop(). Otherwise it
   * return the value unchanged.
   *
   * @function resolveTransformValue
   * @private
   * @param   {Object[]}       segments  An array of path segments, from parseSegments().
   * @param   {mixed}          val       A value from the JSON object. May be any valid JSON value.
   * @param   {String|Number}  key       The corresponding key. String for objects, numbers for arrays.
   * @param   {Function}       callback  The callback to apply to matched values. The callback receives as its
   *                                     parameter the value in question.
   * @return  {mixed}                    The given value, unchanged or not.
   */
  function resolveTransformValue(segments, val, key, callback) {
    if (key === segments[0].identifier) {
      if (segments.length === 1) {
        return callback(val);
      } else {
        return transformLoop(val, segments.slice(1), callback);
      }
    } else if (val !== null && typeof val === 'object' && (segments[0].type === 'deep' || typeof key === 'number')) {
      return transformLoop(val, segments, callback);
    }
    return val;
  }



  /**
   * Loops through an object or array and delegates each value to resolveValue().
   *
   * @function transformLoop
   * @private
   * @param   {Object|Array}  json      Any valid JSON.
   * @param   {Object[]}      segments  An array of path segments, from parseSegments().
   * @param   {Function}      callback  The callback to apply to matched values.
   * @return  {Object|Array}            The transformed JSON object.
   */
  function transformLoop(json, remainingSegments, callback) {
    var memory;

    if (json instanceof Array) {
      memory = [];
      for (var i = 0, l = json.length; i < l; i++) {
        memory[i] = resolveTransformValue(remainingSegments, json[i], i, callback);
      }
    } else {
      memory = {};
      for (var prop in json) {
        if (json.hasOwnProperty(prop)) {
          memory[prop] = resolveTransformValue(remainingSegments, json[prop], prop, callback);
        }
      }
    }

    return memory;
  }



  /**
   * The Roam object.
   *
   * @class   Roam
   * @param   {Object|String} json   A JSON string or JSON-compatible JavaScript object.
   * @return  {Object}               An instance of Roam.
   */
  function Roam(json) {

    if (typeof json === 'string') {
      json = JSON.parse(json);
    }

    this.json = json;

  }



  /**
   * Get executes a complete search of all matching properties in the given JSON.
   *
   * @function get
   * @memberof Roam
   * @instance
   * @param  {String}   path     A period-separated property path.
   * @return {Array}             An array containing all matching values.
   */
  Roam.prototype.get = function(path) {
    return search(parseSegments(path), this.json);
  };



  /**
   * One executes an exit-early search. It will stop searching as soon as it finds a matching value, and return it.
   *
   * @function one
   * @memberof Roam
   * @instance
   * @param  {String}   path     A period-separated property path.
   * @return {mixed|undefined}   The first matched value, or undefined if no matching value could be found.
   */
  Roam.prototype.one = function(path) {
    return search(parseSegments(path), this.json, true)[0];
  };



  /**
   * Transform applies a callback to matched values, and updates them in-place in the document. It will then return the
   * document in its entirety. Utilizes transformLoop and resolveTransformValue to match and apply transformations.
   *
   * @function transform
   * @memberof Roam
   * @instance
   * @param  {String}   path     A period-separated property path.
   * @param  {Function} callback A callback with which to transform the matched values in-place. The callback receives
   *                             as its parameters the current value to be transformed.
   * @return {Object|Array}      The transformed object.
   */
  Roam.prototype.transform = function(path, callback) {
    var segments = parseSegments(path);

    if (!callback || !segments.length) {
      return this.json;
    }

    return transformLoop(this.json, segments, callback);
  };



  /**
   * Has is a convenience method which checks if .one returned a value.
   *
   * @function has
   * @memberof Roam
   * @instance
   * @param  {String}   path     A period-separated property path.
   * @return {Boolean}           Whether or not a value could be found in the document.
   */
  Roam.prototype.has = function(path) {
    return this.one(path) !== undefined;
  };



  /**
   * Count is a convenience method which returns the length of the array from .get.
   *
   * @function count
   * @memberof Roam
   * @instance
   * @param  {String}   path     A period-separated property path.
   * @return {Number}            The number of matched properties
   */
  Roam.prototype.count = function(path) {
    return this.get(path).length;
  };



  /**
   * Filter is a thinner, faster re-implementation of the native Array.prototype.filter. It does not support
   * binding a custom value to `this` within the callback.
   *
   * @function filter
   * @memberof Roam
   * @instance
   * @param  {String}   path     A period-separated property path.
   * @param  {Function} callback A function which is expected to return a truthy or falsy value. The callback receives
   *                             as its arguments the current value, the current index and the original array.
   * @return {Array}             An array of the original values, minus those for which the callback returned falsy.
   */
  Roam.prototype.filter = function(path, callback) {
    var data, arr = [];
    data = this.get(path);

    for (var i = 0, l = data.length; i < l; i++) {
      if (callback(data[i], i, data)) {
        arr.push(data[i]);
      }
    }

    return arr;
  };



  /**
   * Map is a thinner, faster re-implementation of the native Array.prototype.map. It does not support
   * binding a custom value to `this` within the callback.
   *
   * @function map
   * @memberof Roam
   * @instance
   * @param  {String}   path     A period-separated property path.
   * @param  {Function} callback A function which is expected to return any value. The callback receives
   *                             as its arguments the current value, the current index and the original array.
   * @return {Array}             An array of the original values transformed by the callback.
   */
  Roam.prototype.map = function(path, callback) {
    var data, arr = [];
    data = this.get(path);

    for (var i = 0, l = data.length; i < l; i++) {
      arr.push(callback(data[i], i, data));
    }

    return arr;
  };



  /**
   * The exported function is a constructor for the Roam object.
   *
   * @constructs Roam
   * @param      {Object|String} json  A JSON string or JSON-compatible JavaScript object.
   * @return     {Roam}                A constructed Roam-object.
   */
  return function(json) {
    return new Roam(json);
  };

}));
