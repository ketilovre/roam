/* global JPath, _ */

(function() {
  "use strict";

  JPath.prototype.shallow = function(identifier, key, value) {
    var prop, memory = [];

    if (_.isPlainObject(value)) {
      for (prop in value) {
        if (value.hasOwnProperty(prop) && prop === identifier) {
          memory.push(value[prop]);
        }
      }
    } else if (_.isArray(value) && _.isNumber(key)) {
      for(var i = 0, l = value.length; i < l; i++) {
        for (prop in value[i]) {
          if (value[i].hasOwnProperty(prop) && prop === identifier) {
            memory.push(value[i][prop]);
          }
        }
      }
    }
    return memory;
  };

  JPath.prototype.deep = function(identifier, value) {
    var memory = [];

    function loop(json) {
      _.forEach(json, function(val, key) {
        if (key === identifier) {
          memory.push(val);
        } else {
          if (_.isArray(val) || _.isPlainObject(val)) {
            loop(val);
          }
        }
      });
    }

    loop(value);
    return memory;
  };

})();
