/* exported Roam */

var Roam = function(json) {
  "use strict";

  if (typeof json === 'string') {
    json = JSON.parse(json);
  }

  this.json = json;

};
