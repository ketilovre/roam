/* global Roam */

(function() {
  "use strict";

  Roam.prototype.get = function(path) {
    var tmp, memory, segment, segments;

    segments = this.parseSegments(path);
    memory = this.json;
    while (segments.length) {

      segment = segments.shift();

      tmp = [];

      if (segment.type === 'shallow') {
        tmp = tmp.concat(this.shallow(segment.identifier, memory));
      } else {
        if (memory instanceof Array) {
          for (var i = 0, l = memory.length; i < l; i++) {
            tmp = tmp.concat(this.deep(segment.identifier, memory[i]));
          }
        } else if (memory !== null && typeof memory === 'object') {
          for (var prop in memory) {
            if (memory.hasOwnProperty(prop)) {
              tmp = tmp.concat(this.deep(segment.identifier, memory[prop]));
            }
          }
        }
      }

      memory = tmp;
    }

    return memory;
  };

  Roam.prototype.transform = function(path, callback) {
    var segments = this.parseSegments(path);

    if (!callback || !segments.length) {
      return this.json;
    }

    function resolveValue(segments, val, key) {
      if (key === segments[0].identifier && segments.length === 1) {
        return callback(val);
      } else if (key === segments[0].identifier) {
        return loop(val, segments.slice(1));
      } else if (val !== null && typeof val === 'object' && (segments[0].type === 'deep' || typeof key === 'number')) {
        return loop(val, segments);
      }
      return val;
    }

    function loop(json, remainingSegments) {
      var memory = [];

      if (json instanceof Array) {
        for (var i = 0, l = json.length; i < l; i++) {
          memory.push({
            key: i,
            val: resolveValue(remainingSegments, json[i], i)
          });
        }
      } else {
        for (var prop in json) {
          if (json.hasOwnProperty(prop)) {
            memory.push({
              key: prop,
              val: resolveValue(remainingSegments, json[prop], prop)
            });
          }
        }
      }

      return memory.reduce(function(accumulator, item) {
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
