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
            return segments.reduce(function(accumulator, segment) {
                return accumulator.map(function(val) {
                    if (segment.type === "deep") {
                        return jpath.deep(segment.identifier, val);
                    } else {
                        return jpath.shallow(segment.identifier, val);
                    }
                }).reduce(function(a, b) {
                    return a.concat(b);
                }, []);
            }, this.json);
        };
        JPath.prototype.map = function(path, callback) {
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
                        } else if (remainingSegments[0].type === "deep" && (_.isArray(val) || _.isPlainObject(val))) {
                            return {
                                key: key,
                                val: loop(val, remainingSegments)
                            };
                        } else if ((_.isArray(val) || _.isPlainObject(val)) && _.isNumber(key)) {
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
        JPath.prototype.shallow = function(identifier, json) {
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
        JPath.prototype.deep = function(identifier, json) {
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
    })();
    (function() {
        "use strict";
        JPath.prototype.parseSegments = function(path) {
            if (!path) {
                return [];
            }
            return path.match(/(\/\/|\/)(\w+)/g).map(function(val) {
                if (val.indexOf("//") > -1) {
                    return {
                        type: "deep",
                        identifier: val.replace(/\/\/|\//, "")
                    };
                } else {
                    return {
                        type: "shallow",
                        identifier: val.replace(/\/\/|\//, "")
                    };
                }
            });
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