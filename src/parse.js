/* global JPath */

(function() {
  "use strict";

  JPath.prototype.parseSegments = function(path) {

    if (!path) {
      return [];
    }

    return path.match(/(\/\/|\/)(\w+)/g).map(function(val) {
      if (val.indexOf("//") > -1) {
        return {
          type: 'deep',
          identifier: val.replace(/\/\/|\//, '')
        };
      } else {
        return {
          type: 'shallow',
          identifier: val.replace(/\/\/|\//, '')
        };
      }
    });
  };

})();
