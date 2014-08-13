/* global Roam */

(function() {
  "use strict";

  function shallow(identifier, value) {
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
  }

  function deep(identifier, value) {
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
  }

  Roam.prototype.get = function(path) {
    var tmp, segment,
    segments = this.parseSegments(path),
    memory = this.json;

    while (segments.length) {

      segment = segments.shift();

      tmp = [];

      if (segment.type === 'shallow') {
        tmp = shallow(segment.identifier, memory);
      } else {
        if (memory instanceof Array) {
          for (var i = 0, l = memory.length; i < l; i++) {
            tmp = tmp.concat(deep(segment.identifier, memory[i]));
          }
        } else if (memory !== null && typeof memory === 'object') {
          for (var prop in memory) {
            if (memory.hasOwnProperty(prop)) {
              tmp = tmp.concat(deep(segment.identifier, memory[prop]));
            }
          }
        }
      }

      memory = tmp;
    }

    return memory;
  };

})();
