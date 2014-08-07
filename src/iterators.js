/* global JPath, _ */

(function() {
  "use strict";

  JPath.prototype.shallow = function(identifier, json) {
    if (_.isArray(json)) {
      return json.map(function(val) {
        return _.filter(val, function(asd, key) {
          return key === identifier;
        });
      }).reduce(function(a, b) {
        return a.concat(b);
      }, []);
    }
    return _.filter(json, function(val, key) {
      return key === identifier;
    });
  };

  JPath.prototype.deep = function(identifier, json) {
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

    loop(json);
    return memory;
  };

})();
