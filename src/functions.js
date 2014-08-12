/* global Roam */

(function() {
  "use strict";

  Roam.prototype.get = function(path) {
    var tmp, segment,
    segments = this.parseSegments(path),
    memory = this.json;

    while (segments.length) {

      segment = segments.shift();

      tmp = [];

      if (segment.type === 'shallow') {
        tmp = this.shallow(segment.identifier, memory);
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
      if (key === segments[0].identifier) {
        if (segments.length === 1) {
          return callback(val);
        } else {
          return loop(val, segments.slice(1));
        }
      } else if (val !== null && typeof val === 'object' && (segments[0].type === 'deep' || typeof key === 'number')) {
        return loop(val, segments);
      }
      return val;
    }

    function loop(json, remainingSegments) {
      var memory;

      if (json instanceof Array) {
        memory = [];
        for (var i = 0, l = json.length; i < l; i++) {
          memory[i] = resolveValue(remainingSegments, json[i], i);
        }
      } else {
        memory = {};
        for (var prop in json) {
          if (json.hasOwnProperty(prop)) {
            memory[prop] = resolveValue(remainingSegments, json[prop], prop);
          }
        }
      }

      return memory;
    }

    return loop(this.json, segments);
  };

})();
