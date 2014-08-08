(function(exports, global) {
    global["jpath"] = exports;
    var _ = global._;
    if (typeof _ === "undefined") {
        if (typeof require !== "undefined") {
            _ = require("lodash");
        } else {
            throw new Error("j requires lodash");
        }
    }
    var JPath = function(json) {
        "use strict";
        this.json = json;
    };
    (function() {
        "use strict";
        JPath.prototype.get = function(path) {
            var jpath = this, segments = this.parseSegments(path);
            return _.reduce(segments, function(accumulator, segment) {
                return _.flatten(_.map(accumulator, function(val, key) {
                    if (segment.type === "deep") {
                        return jpath.deep(segment.identifier, val);
                    } else {
                        if (key === segment.identifier) {
                            return val;
                        } else {
                            return jpath.shallow(segment.identifier, key, val);
                        }
                    }
                }), true);
            }, this.json);
        };
        JPath.prototype.transform = function(path, callback) {
            var segments = this.parseSegments(path);
            callback = callback || function(input) {
                return input;
            };
            function loop(json, remainingSegments) {
                return _.map(json, function(val, key) {
                    if (remainingSegments.length > 0) {
                        if (key === remainingSegments[0].identifier && remainingSegments.length === 1) {
                            return {
                                key: key,
                                val: callback(val)
                            };
                        } else if (key === remainingSegments[0].identifier) {
                            return {
                                key: key,
                                val: loop(val, remainingSegments.slice(1))
                            };
                        } else if ((remainingSegments[0].type === "deep" || _.isNumber(key)) && (_.isArray(val) || _.isPlainObject(val))) {
                            return {
                                key: key,
                                val: loop(val, remainingSegments)
                            };
                        }
                    }
                    return {
                        key: key,
                        val: val
                    };
                }).reduce(function(accumulator, item) {
                    if (!accumulator) {
                        var base = item.key === 0 ? [] : {};
                        accumulator = base;
                    }
                    accumulator[item.key] = item.val;
                    return accumulator;
                }, null);
            }
            return loop(this.json, segments);
        };
    })();
    (function() {
        "use strict";
        JPath.prototype.shallow = function(identifier, key, value) {
            var prop, memory = [];
            if (_.isPlainObject(value)) {
                for (prop in value) {
                    if (value.hasOwnProperty(prop) && prop === identifier) {
                        memory.push(value[prop]);
                    }
                }
            } else if (_.isArray(value) && _.isNumber(key)) {
                for (var i = 0, l = value.length; i < l; i++) {
                    for (prop in value[i]) {
                        if (value[i].hasOwnProperty(prop) && prop === identifier) {
                            memory.push(value[i][prop]);
                        }
                    }
                }
            }
            return memory;
        };
        JPath.prototype.deep = function(identifier, value) {
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
            loop(value);
            return memory;
        };
    })();
    (function() {
        "use strict";
        JPath.prototype.parseSegments = function(path) {
            var offset = 0, limit = 0, segments = [];
            if (!path) {
                return [];
            }
            while (limit >= 0) {
                path = path.substr(limit + offset);
                offset = path.charAt(1) === "/" ? 2 : 1;
                limit = path.indexOf("/", offset) - offset;
                var segment = {
                    type: offset === 2 ? "deep" : "shallow",
                    identifier: path.substr(offset, limit > 0 ? limit : undefined)
                };
                segments.push(segment);
            }
            return segments;
        };
    })();
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
            return _.map(this.get(path), callback);
        };
    })();
    (function() {
        "use strict";
        var jpath = function(json) {
            return new JPath(json);
        };
        if (typeof module !== "undefined" && module.exports) {
            module.exports = jpath;
        } else {
            global.jpath = jpath;
        }
    })();
})({}, function() {
    return this;
}());