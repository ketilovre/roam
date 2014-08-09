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

  JPath.prototype.filter = function(path, callback) {
    var data, index = -1, arr = [];
    data = this.get(path);

    while (++index < data.length) {
      if (callback(data[index], index, data)) {
        arr.push(data[index]);
      }
    }

    return arr;
  };

  JPath.prototype.map = function(path, callback) {
    var data, index = -1, arr = [];
    data = this.get(path);

    while (++index < data.length) {
      arr.push(callback(data[index], index, data));
    }

    return arr;
  };

})();
