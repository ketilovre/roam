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
    function parseSegments(path) {
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
    }
    function shallowSearch(identifier, value, exitEarly) {
        var current, memory = [];
        if (!(value instanceof Array) && value.hasOwnProperty(identifier)) {
            memory.push(value[identifier]);
        } else {
            outer: for (var i = 0, l = value.length; i < l; i++) {
                current = value[i];
                if (current.hasOwnProperty(identifier)) {
                    memory.push(current[identifier]);
                } else if (current instanceof Array) {
                    for (var j = 0, m = current.length; j < m; j++) {
                        if (current[j].hasOwnProperty(identifier)) {
                            memory.push(current[j][identifier]);
                            if (exitEarly) {
                                break outer;
                            }
                        }
                    }
                } else if (+identifier === i) {
                    memory.push(current);
                }
                if (exitEarly && memory.length) {
                    break;
                }
            }
        }
        return memory;
    }
    function deepSearch(identifier, value, exitEarly) {
        var memory = [];
        function innerLoop(json) {
            if (!exitEarly || !memory.length) {
                if (json instanceof Array) {
                    for (var i = 0, l = json.length; i < l; i++) {
                        innerLoop(json[i]);
                    }
                } else if (json !== null && typeof json === "object") {
                    if (json.hasOwnProperty(identifier)) {
                        memory.push(json[identifier]);
                    }
                    for (var prop in json) {
                        if (prop !== identifier && json[prop] !== null && typeof json[prop] === "object") {
                            innerLoop(json[prop]);
                        }
                    }
                }
            }
        }
        innerLoop(value);
        return memory;
    }
    function search(segments, json, exitEarly) {
        var result, segment, memory = json;
        while (segments.length) {
            segment = segments.shift();
            result = [];
            if (segment.type === "shallow") {
                result = shallowSearch(segment.identifier, memory, exitEarly);
            } else {
                if (memory instanceof Array) {
                    for (var i = 0, l = memory.length; i < l; i++) {
                        result = result.concat(deepSearch(segment.identifier, memory[i], exitEarly));
                    }
                } else if (memory !== null && typeof memory === "object") {
                    for (var prop in memory) {
                        if (memory.hasOwnProperty(prop)) {
                            result = result.concat(deepSearch(segment.identifier, memory[prop], exitEarly));
                        }
                    }
                }
            }
            memory = result;
        }
        return memory;
    }
    function resolveTransformValue(segments, val, key, callback) {
        if (key === segments[0].identifier) {
            if (segments.length === 1) {
                return callback(val);
            } else {
                return transformLoop(val, segments.slice(1), callback);
            }
        } else if (val !== null && typeof val === "object" && (segments[0].type === "deep" || typeof key === "number")) {
            return transformLoop(val, segments, callback);
        }
        return val;
    }
    function transformLoop(json, remainingSegments, callback) {
        var memory;
        if (json instanceof Array) {
            memory = [];
            for (var i = 0, l = json.length; i < l; i++) {
                memory[i] = resolveTransformValue(remainingSegments, json[i], i, callback);
            }
        } else {
            memory = {};
            for (var prop in json) {
                if (json.hasOwnProperty(prop)) {
                    memory[prop] = resolveTransformValue(remainingSegments, json[prop], prop, callback);
                }
            }
        }
        return memory;
    }
    function Roam(json) {
        if (typeof json === "string") {
            json = JSON.parse(json);
        }
        this.json = json;
    }
    Roam.prototype.get = function(path) {
        return search(parseSegments(path), this.json);
    };
    Roam.prototype.one = function(path) {
        return search(parseSegments(path), this.json, true)[0];
    };
    Roam.prototype.transform = function(path, callback) {
        var segments = parseSegments(path);
        if (!callback || !segments.length) {
            return this.json;
        }
        return transformLoop(this.json, segments, callback);
    };
    Roam.prototype.has = function(path) {
        return this.one(path) !== undefined;
    };
    Roam.prototype.count = function(path) {
        return this.get(path).length;
    };
    Roam.prototype.filter = function(path, callback) {
        var data, arr = [];
        data = this.get(path);
        for (var i = 0, l = data.length; i < l; i++) {
            if (callback(data[i], i, data)) {
                arr.push(data[i]);
            }
        }
        return arr;
    };
    Roam.prototype.map = function(path, callback) {
        var data, arr = [];
        data = this.get(path);
        for (var i = 0, l = data.length; i < l; i++) {
            arr.push(callback(data[i], i, data));
        }
        return arr;
    };
    Roam.prototype.distinct = function(path) {
        return this.filter(path, function(value, index, self) {
            return self.indexOf(value) === index;
        });
    };
    return function(json) {
        return new Roam(json);
    };
});