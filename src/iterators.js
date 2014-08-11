/* global Roam */

(function() {
  "use strict";

  Roam.prototype.shallow = function(identifier, value) {
    var current, j, i = -1, memory = [];

    if (!(value instanceof Array) && value.hasOwnProperty(identifier)) {
      memory.push(value[identifier]);
    } else {

      while (++i < value.length) {

        current = value[i];

        if (current.hasOwnProperty(identifier)) {
          memory.push(current[identifier]);
        } else if (current instanceof Array) {

          j = -1;

          while (++j < current.length) {
            if (current[j].hasOwnProperty(identifier)) {
              memory.push(current[j][identifier]);
            }
          }
        } else if (+identifier === i) {
          memory.push(current);
        }
      }
    }

    return memory;
  };

  Roam.prototype.deep = function(identifier, value) {
    var memory = [];

    function loop(json) {
      var i = -1;

      if (json instanceof Array) {
        while (++i < json.length) {
          loop(json[i]);
        }
      } else if (json !== null && typeof json === 'object') {
        if (json.hasOwnProperty(identifier)) {
          memory.push(json[identifier]);
        }
        for (var prop in json) {
          if (json[prop] !== null && typeof json[prop] === 'object') {
            loop(json[prop]);
          }
        }
      }
    }

    loop(value);
    return memory;
  };

})();
