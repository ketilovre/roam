/* global JPath */

(function() {
  "use strict";

  JPath.prototype.parseSegments = function(path) {
    var offset = 0, limit = 0, segments = [];

    if (!path) {
      return [];
    }

    while (limit >= 0) {

      path = path.substr(limit + offset);

      offset = path.charAt(1) === '/' ? 2 : 1;
      limit = path.indexOf('/', offset) - offset;

      var segment = {
        type: offset === 2 ? 'deep' : 'shallow',
        identifier: path.substr(offset, limit > 0 ? limit : undefined)
      };

      segments.push(segment);

    }

    return segments;
  };

})();
