/* global JPath, previous */

(function() {
  "use strict";

  var j = function(json) {
    return new JPath(json);
  };

  JPath.prototype.noConflict = function() {
    global.j = previous;
    return j;
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = j;
  } else {
    global.j = j;
  }

})();
