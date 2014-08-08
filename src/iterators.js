/* global JPath */

(function() {
  "use strict";

  JPath.prototype.shallow = function(identifier, value) {
    var memory = [];

    if (value[identifier]) {
      memory.push(value[identifier]);
    } else {
      for (var i = 0, l = value.length; i < l; i++) {
        if (value[i] instanceof Array) {
          for (var j = 0, k = value[i].length; j < k; j++) {
            if (value[i][j][identifier]) {
              memory.push(value[i][j][identifier]);
            }
          }
        } else if (value[i][identifier]) {
          memory.push(value[i][identifier]);
        }
      }
    }

    return memory;
  };

  JPath.prototype.deep = function(identifier, value) {
    var memory = [];

    function loop(json) {
      if (json instanceof Array) {
        for (var i = 0, l = json.length; i < l; i++) {
          loop(json[i]);
        }
      } else {
        if (json[identifier]) {
          memory.push(json[identifier]);
        }
        if (json && json.toString() === '[object Object]') {
          for (var prop in json) {
            if (json.hasOwnProperty(prop)) {
              loop(json[prop]);
            }
          }
        }
      }
    }

    loop(value);
    return memory;
  };

})();
