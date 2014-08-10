/* jshint ignore:start */
/* istanbul ignore:next */
(function (root, factory) {

    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.roam = factory();
  }

}(this, function () {

    return function(json) {
      return new Roam(json);
    };

}));
/* jshint ignore:start */
