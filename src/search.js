/* global Roam */

(function() {
  "use strict";

  function shallow(identifier, value, exitEarly) {
    var current, memory = [];

    if (!(value instanceof Array) && value.hasOwnProperty(identifier)) {
      memory.push(value[identifier]);
    } else {

      outer:
      for (var i = 0, l = value.length; i < l; i++) {

        current = value[i];

        if (current.hasOwnProperty(identifier)) {
          memory.push(current[identifier]);
        } else if (current instanceof Array) {

          for (var j = 0, m = current.length; j < m; j++) {
            if (current[j].hasOwnProperty(identifier)) {
              memory.push(current[j][identifier]);
              if (exitEarly) {
                break outer;
              }
            }
          }
        } else if (+identifier === i) {
          memory.push(current);
        }
        if (exitEarly && memory.length) {
          break;
        }
      }
    }

    return memory;
  }

  function deep(identifier, value, exitEarly) {
    var memory = [];

    function loop(json) {
      var i = -1;

      if (!exitEarly || !memory.length) {
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
    }

    loop(value);
    return memory;
  }

  function search(segments, json, exitEarly) {
    var tmp, segment,
    memory = json;

    while (segments.length) {

      segment = segments.shift();

      tmp = [];

      if (segment.type === 'shallow') {
        tmp = shallow(segment.identifier, memory, exitEarly);
      } else {
        if (memory instanceof Array) {
          for (var i = 0, l = memory.length; i < l; i++) {
            tmp = tmp.concat(deep(segment.identifier, memory[i], exitEarly));
          }
        } else if (memory !== null && typeof memory === 'object') {
          for (var prop in memory) {
            if (memory.hasOwnProperty(prop)) {
              tmp = tmp.concat(deep(segment.identifier, memory[prop], exitEarly));
            }
          }
        }
      }

      memory = tmp;
    }

    return memory;
  }

  Roam.prototype.get = function(path) {
    return search(this.parseSegments(path), this.json);
  };

  Roam.prototype.one = function(path) {
    return search(this.parseSegments(path), this.json, true)[0];
  };

})();
