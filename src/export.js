/* global Roam, define */

(function (root, factory) {
  "use strict";

  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module !== 'undefined' && typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.roam = factory();
  }

}(this, function () {
  "use strict";

  return function(json) {
    return new Roam(json);
  };

}));
