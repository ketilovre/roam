/* global JPath, _ */

(function() {
  "use strict";

  JPath.prototype.get = function(path) {
    var tmp, memory, jpath = this, segment, segments = this.parseSegments(path);

    memory = this.json;
    while (segments.length) {

      segment = segments.shift();

      tmp = [];

      if (segment.type === 'shallow') {
        tmp = tmp.concat(jpath.shallow(segment.identifier, memory));
      } else {
        if (memory instanceof Array) {
          for (var h = 0, m = memory.length; h < m; h++) {
            tmp = tmp.concat(jpath.deep(segment.identifier, memory[h]));
          }
        } else {
          for (var prop in memory) {
            if (memory.hasOwnProperty(prop)) {
              tmp = tmp.concat(jpath.deep(segment.identifier, memory[prop]));
            }
          }
        }
      }

      memory = tmp;
    }

    return memory;
  };

  JPath.prototype.transform = function(path, callback) {
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
          } else if ((remainingSegments[0].type === 'deep' || _.isNumber(key)) && (_.isArray(val) || _.isPlainObject(val))) {
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
