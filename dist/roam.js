(function(exports, global) {
    global["jpath"] = exports;
    var Roam = function(json) {
        "use strict";
        if (typeof json === "string") {
            json = JSON.parse(json);
        }
        this.json = json;
    };
    (function() {
        "use strict";
        Roam.prototype.get = function(path) {
            var tmp, segment, segments = this.parseSegments(path), memory = this.json;
            while (segments.length) {
                segment = segments.shift();
                tmp = [];
                if (segment.type === "shallow") {
                    tmp = this.shallow(segment.identifier, memory);
                } else {
                    if (memory instanceof Array) {
                        for (var i = 0, l = memory.length; i < l; i++) {
                            tmp = tmp.concat(this.deep(segment.identifier, memory[i]));
                        }
                    } else if (memory !== null && typeof memory === "object") {
                        for (var prop in memory) {
                            if (memory.hasOwnProperty(prop)) {
                                tmp = tmp.concat(this.deep(segment.identifier, memory[prop]));
                            }
                        }
                    }
                }
                memory = tmp;
            }
            return memory;
        };
        Roam.prototype.transform = function(path, callback) {
            var segments = this.parseSegments(path);
            if (!callback || !segments.length) {
                return this.json;
            }
            function resolveValue(segments, val, key) {
                if (key === segments[0].identifier) {
                    if (segments.length === 1) {
                        return callback(val);
                    } else {
                        return loop(val, segments.slice(1));
                    }
                } else if (val !== null && typeof val === "object" && (segments[0].type === "deep" || typeof key === "number")) {
                    return loop(val, segments);
                }
                return val;
            }
            function loop(json, remainingSegments) {
                var memory;
                if (json instanceof Array) {
                    memory = [];
                    for (var i = 0, l = json.length; i < l; i++) {
                        memory[i] = resolveValue(remainingSegments, json[i], i);
                    }
                } else {
                    memory = {};
                    for (var prop in json) {
                        if (json.hasOwnProperty(prop)) {
                            memory[prop] = resolveValue(remainingSegments, json[prop], prop);
                        }
                    }
                }
                return memory;
            }
            return loop(this.json, segments);
        };
    })();
    (function() {
        "use strict";
        Roam.prototype.shallow = function(identifier, value) {
            var current, j, i = -1, memory = [];
            if (!(value instanceof Array) && value.hasOwnProperty(identifier)) {
                memory.push(value[identifier]);
            } else {
                while (++i < value.length) {
                    current = value[i];
                    if (current.hasOwnProperty(identifier)) {
                        memory.push(current[identifier]);
                    } else if (current instanceof Array) {
                        j = -1;
                        while (++j < current.length) {
                            if (current[j].hasOwnProperty(identifier)) {
                                memory.push(current[j][identifier]);
                            }
                        }
                    } else if (+identifier === i) {
                        memory.push(current);
                    }
                }
            }
            return memory;
        };
        Roam.prototype.deep = function(identifier, value) {
            var memory = [];
            function loop(json) {
                var i = -1;
                if (json instanceof Array) {
                    while (++i < json.length) {
                        loop(json[i]);
                    }
                } else if (json !== null && typeof json === "object") {
                    if (json.hasOwnProperty(identifier)) {
                        memory.push(json[identifier]);
                    }
                    for (var prop in json) {
                        if (json[prop] !== null && typeof json[prop] === "object") {
                            loop(json[prop]);
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
        Roam.prototype.parseSegments = function(path) {
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
    (function(root, factory) {
        "use strict";
        if (typeof define === "function" && define.amd) {
            define([], factory);
        } else if (typeof module !== "undefined" && typeof exports === "object") {
            module.exports = factory();
        } else {
            root.roam = factory();
        }
    })(this, function() {
        "use strict";
        return function(json) {
            return new Roam(json);
        };
    });
})({}, function() {
    return this;
}());