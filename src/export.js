/* global JPath */

(function() {
  "use strict";

  var jpath = function(json) {
    return new JPath(json);
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = jpath;
  } else {
    global.jpath = jpath;
  }

})();
