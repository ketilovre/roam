/* global JPath */

(function() {
  "use strict";

  JPath.prototype.shallow = function(identifier, value) {
    var j, i = -1, memory = [];

    if (value[identifier]) {
      memory.push(value[identifier]);
    } else {

      while (++i < value.length) {
        if (value[i] instanceof Array) {

          j = -1;
          while (++j < value[i].length) {
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
      var i = -1;

      if (json instanceof Array) {
        while (++i < json.length) {
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
