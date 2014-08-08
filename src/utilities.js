/* global JPath */

(function() {
  "use strict";

  JPath.prototype.has = function(path) {
    return !!this.get(path).length;
  };

  JPath.prototype.count = function(path) {
    return this.get(path).length;
  };

  JPath.prototype.one = function(path) {
    return this.get(path).shift();
  };

  JPath.prototype.map = function(path, callback) {
    return this.get(path).map(callback);
  };

})();
