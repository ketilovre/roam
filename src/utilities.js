/* global Roam */

(function() {
  "use strict";

  Roam.prototype.has = function(path) {
    return !!this.get(path).length;
  };

  Roam.prototype.count = function(path) {
    return this.get(path).length;
  };

  Roam.prototype.one = function(path) {
    return this.get(path).shift();
  };

  Roam.prototype.filter = function(path, callback) {
    var data, index = -1, arr = [];
    data = this.get(path);

    while (++index < data.length) {
      if (callback(data[index], index, data)) {
        arr.push(data[index]);
      }
    }

    return arr;
  };

  Roam.prototype.map = function(path, callback) {
    var data, index = -1, arr = [];
    data = this.get(path);

    while (++index < data.length) {
      arr.push(callback(data[index], index, data));
    }

    return arr;
  };

})();
