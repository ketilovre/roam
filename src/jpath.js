/* exported JPath */

var _ = global._;

/* istanbul ignore next */
if (typeof _ === 'undefined') {
  if (typeof require !== 'undefined') {
    _ = require('lodash');
  } else {
    throw new Error('j requires lodash');
  }
}

var JPath = function(json) {
  "use strict";

  this.json = json;

};
