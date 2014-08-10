/* global Roam */

(function() {
  "use strict";

  var roam = function(json) {
    return new Roam(json);
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = roam;
  } else {
    global.roam = roam;
  }

})();
