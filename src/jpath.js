/* exported JPath, previous */

var previous = global.j;

var _ = global._;

if (typeof _ === 'undefined') {
  if (typeof require !== 'undefined') {
    _ = require('lodash');
  } else {
    throw new Error('j requires lodash');
  }
}

var JPath = function(json) {
  "use strict";

  var self = this;

  this.json = json;

  this.get = function(path) {
    var segments, firstSegment, firstPass;

    segments = this.parseSegments(path);

    if (segments.length === 0) {
      return this.json;
    }

    firstSegment = segments.shift();

    if (firstSegment.type === 'deep') {
      firstPass = this.deep(firstSegment.identifier, this.json);
    } else {
      firstPass = this.shallow(firstSegment.identifier, this.json);
    }

    if (segments.length === 0) {
      return firstPass;
    }

    return segments.reduce(function(accumulator, segment) {
      return accumulator.map(function(val) {
        if (segment.type === 'deep') {
          return self.deep(segment.identifier, val);
        } else {
          return self.shallow(segment.identifier, val);
        }
      }).reduce(function(a, b) {
        return a.concat(b);
      }, []);
    }, firstPass);
  };

  this.shallow = function(identifier, json) {
    if (_.isArray(json)) {
      return json.map(function(val) {
        return _.filter(val, function(asd, key) {
          return key === identifier;
        });
      }).reduce(function(a, b) {
        return a.concat(b);
      }, []);
    }
    return _.filter(json, function(val, key) {
      return key === identifier;
    });
  };

  this.deep = function(identifier, json) {
    var memory = [];

    function loop(json) {
      _.forEach(json, function(val, key) {
        if (key === identifier) {
          memory.push(val);
        } else {
          if (_.isArray(val) || _.isPlainObject(val)) {
            loop(val);
          }
        }
      });
    }

    loop(json);
    return memory;
  };
};
