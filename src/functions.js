/* global JPath, _ */

(function() {
  "use strict";

  JPath.prototype.get = function(path) {
    var jpath = this, segments = this.parseSegments(path);


    return segments.reduce(function(accumulator, segment) {
      return accumulator.map(function(val) {
        if (segment.type === 'deep') {
          return jpath.deep(segment.identifier, val);
        } else {
          return jpath.shallow(segment.identifier, val);
        }
      }).reduce(function(a, b) {
        return a.concat(b);
      }, []);
    }, this.json);
  };

  JPath.prototype.map = function(path, callback) {
    var segments = this.parseSegments(path);

    callback = callback || function(input) { return input; };

    function loop(json, remainingSegments) {
      return _.map(json, function(val, key) {
        if (remainingSegments.length > 0) {
          if (key === remainingSegments[0].identifier && remainingSegments.length === 1) {
            return {
              key: key,
              val: callback(val)
            };
          } else if (key === remainingSegments[0].identifier) {
            return {
              key: key,
              val: loop(val, remainingSegments.slice(1))
            };
          } else if (remainingSegments[0].type === 'deep' && (_.isArray(val) || _.isPlainObject(val))) {
            return {
              key: key,
              val: loop(val, remainingSegments)
            };
          } else if ((_.isArray(val) || _.isPlainObject(val)) && _.isNumber(key)) {
            return {
              key: key,
              val: loop(val, remainingSegments)
            };
          }
        }
        return {
          key: key,
          val: val
        };
      }).reduce(function(accumulator, item) {
        if (!accumulator) {
          var base = item.key === 0 ? [] : {};
          accumulator = base;
        }
        accumulator[item.key] = item.val;
        return accumulator;
      }, null);
    }

    return loop(this.json, segments);
  };

})();
