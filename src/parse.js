/* global JPath */

(function() {
  "use strict";

  JPath.prototype.parseSegments = function(path) {
    var isRecursive, index = -1, result = [];

    if (!path) {
      return [];
    }

    var segments = path.split('.');

    while (++index < segments.length) {

      isRecursive = segments[index].charAt(0) === '*';

      result.push({
        type: isRecursive ? 'deep' : 'shallow',
        identifier: isRecursive ? segments[index].slice(1) : segments[index]
      });

    }

    return result;
  };

})();
