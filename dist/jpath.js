(function(exports, global) {
    global["jpath"] = exports;
    var JPath = function(json) {
        "use strict";
        this.json = json;
    };
    (function() {
        "use strict";
        JPath.prototype.get = function(path) {
            var tmp, memory, jpath = this, segment, segments = this.parseSegments(path);
            memory = this.json;
            while (segments.length) {
                segment = segments.shift();
                tmp = [];
                if (segment.type === "shallow") {
                    tmp = tmp.concat(jpath.shallow(segment.identifier, memory));
                } else {
                    if (memory instanceof Array) {
                        for (var h = 0, m = memory.length; h < m; h++) {
                            tmp = tmp.concat(jpath.deep(segment.identifier, memory[h]));
                        }
                    } else {
                        for (var prop in memory) {
                            if (memory.hasOwnProperty(prop)) {
                                tmp = tmp.concat(jpath.deep(segment.identifier, memory[prop]));
                            }
                        }
                    }
                }
                memory = tmp;
            }
            return memory;
        };
        JPath.prototype.transform = function(path, callback) {
            var segments = this.parseSegments(path);
            if (!callback || !segments.length) {
                return this.json;
            }
            function resolveValue(segments, val, key) {
                if (key === segments[0].identifier && segments.length === 1) {
                    return callback(val);
                } else if (key === segments[0].identifier) {
                    return loop(val, segments.slice(1));
                } else if ((segments[0].type === "deep" || typeof key === "number") && (val && val instanceof Array || val.toString() === "[object Object]")) {
                    return loop(val, segments);
                }
                return val;
            }
            function loop(json, remainingSegments) {
                var memory = [];
                if (json instanceof Array) {
                    for (var i = 0, l = json.length; i < l; i++) {
                        memory.push({
                            key: i,
                            val: resolveValue(remainingSegments, json[i], i)
                        });
                    }
                } else {
                    for (var prop in json) {
                        if (json.hasOwnProperty(prop)) {
                            memory.push({
                                key: prop,
                                val: resolveValue(remainingSegments, json[prop], prop)
                            });
                        }
                    }
                }
                return memory.reduce(function(accumulator, item) {
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
        JPath.prototype.shallow = function(identifier, value) {
            var j, i = -1, memory = [];
            if (value[identifier]) {
                memory.push(value[identifier]);
            } else {
                while (++i < value.length) {
                    if (value[i] instanceof Array) {
                        j = -1;
                        while (++j < value[i].length) {
                            if (value[i][j][identifier]) {
                                memory.push(value[i][j][identifier]);
                            }
                        }
                    } else if (value[i][identifier]) {
                        memory.push(value[i][identifier]);
                    }
                }
            }
            return memory;
        };
        JPath.prototype.deep = function(identifier, value) {
            var memory = [];
            function loop(json) {
                var i = -1;
                if (json instanceof Array) {
                    while (++i < json.length) {
                        loop(json[i]);
                    }
                } else {
                    if (json[identifier]) {
                        memory.push(json[identifier]);
                    }
                    if (json && json.toString() === "[object Object]") {
                        for (var prop in json) {
                            if (json.hasOwnProperty(prop)) {
                                loop(json[prop]);
                            }
                        }
                    }
                }
            }
            loop(value);
            return memory;
        };
    })();
    (function() {
        "use strict";
        JPath.prototype.parseSegments = function(path) {
            var isRecursive, index = -1, result = [];
            if (!path) {
                return [];
            }
            var segments = path.split(".");
            while (++index < segments.length) {
                isRecursive = segments[index].charAt(0) === "*";
                result.push({
                    type: isRecursive ? "deep" : "shallow",
                    identifier: isRecursive ? segments[index].slice(1) : segments[index]
                });
            }
            return result;
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