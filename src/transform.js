/* global Roam */

(function() {
  "use strict";

  function resolveValue(segments, val, key, callback) {
    if (key === segments[0].identifier) {
      if (segments.length === 1) {
        return callback(val);
      } else {
        return loop(val, segments.slice(1), callback);
      }
    } else if (val !== null && typeof val === 'object' && (segments[0].type === 'deep' || typeof key === 'number')) {
      return loop(val, segments, callback);
    }
    return val;
  }

  function loop(json, remainingSegments, callback) {
    var memory;

    if (json instanceof Array) {
      memory = [];
      for (var i = 0, l = json.length; i < l; i++) {
        memory[i] = resolveValue(remainingSegments, json[i], i, callback);
      }
    } else {
      memory = {};
      for (var prop in json) {
        if (json.hasOwnProperty(prop)) {
          memory[prop] = resolveValue(remainingSegments, json[prop], prop, callback);
        }
      }
    }

    return memory;
  }

  Roam.prototype.transform = function(path, callback) {
    var segments = this.parseSegments(path);

    if (!callback || !segments.length) {
      return this.json;
    }

    return loop(this.json, segments, callback);
  };

})();
