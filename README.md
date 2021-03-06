# Roam

[![Build Status](https://travis-ci.org/ketilovre/roam.svg?branch=master)](https://travis-ci.org/ketilovre/roam)
[![Code Climate](https://codeclimate.com/github/ketilovre/roam/badges/gpa.svg)](https://codeclimate.com/github/ketilovre/roam)
[![Test Coverage](https://codeclimate.com/github/ketilovre/roam/badges/coverage.svg)](https://codeclimate.com/github/ketilovre/roam)

XPath-like queries and in-place transformations for JSON documents.

## Install

    npm install --save roam

or

    bower install --save roam

In the browser, Roam can be used with or without RequireJS.

## The basics

Given the following JSON:

```json
{
  "menu": {
    "id": "file",
    "value": "File",
    "popup": {
      "menuitem": [
        {"value": "New", "onclick": "CreateNewDoc()"},
        {"value": "Open", "onclick": "OpenDoc()"},
        {"value": "Close", "onclick": "CloseDoc()"}
      ]
    }
  }
}
```

All of the following, in order of best to worst performance:

```javascript
roam(json).get('menu.popup.menuitem.onclick')
roam(json).get('*popup.menuitem.onclick')
roam(json).get('*menuitem.onclick')
roam(json).get('*onclick')
```

Will return:

```json
[
  "CreateNewDoc()",
  "OpenDoc()",
  "CloseDoc()"
]
```

### Roam

- `roam({Object|String})`

Construct a `roam` object by wrapping a JSON object or string.

### Search

Search-methods locate and return values based on a given path. Path segments are separated
by periods.

#### Get

- `.get({String})`

`.get` traverses the document and returns an array of matching values.

` roam(json).get('menu.id') ` returns ` ["file"] `

#### One

- `.one({String})`

`.one` immediately returns the first matched property.

`roam(json).one('*menuitem.onclick')` returns `"CreateNewDoc()"`

#### Recursive queries

You can prefix any property with ` * ` to have roam search the document (or current result
set) recursively for a matching value.

`roam(json).get('*value')` returns `["File", "New", "Open", "Close"]`

but

`roam(json).get('menu.popup.*value')` returns `["New", "Open", "Close"]`

If the first segment is a recursive query, roam *will* traverse the entire document. If at all
possible, try to narrow down the search area before going recursive.

#### Arrays

You can also ask for values at specific array indexes. All of these:
```javascript
roam(json).get('menu.popup.menuitem.1')
roam(json).get('*popup.menuitem.1')
roam(json).get('*menuitem.1')
```

Will return:
```json
[
  {
    "value": "Open",
    "onclick": "OpenDoc()"
  }
]
```

### Transform

- `.transform({String}, {Function(value)})`

`.transform` traverses the document, replaces matching values with the return value of the callback,
and returns the document in its entirety.

```javascript
roam(json).transform('*value', function(value) {
  return value.toUpperCase();
});
```

Returns:

```json
{
  "menu": {
    "id": "file",
    "value": "FILE",
    "popup": {
      "menuitem": [
        {"value": "NEW", "onclick": "CreateNewDoc()"},
        {"value": "OPEN", "onclick": "OpenDoc()"},
        {"value": "CLOSE", "onclick": "CloseDoc()"}
      ]
    }
  }
}
```

Or, a slightly sillier example:

```javascript
roam(json).transform('menu.popup.menuitem.value', function(value) {
  return value.split("").map(function(letter, index) {
    return {
      letter: letter,
      index: index
    };
  });
});
```
Returns:
```json
{
   "menu":{
      "id":"file",
      "value":"File",
      "popup":{
         "menuitem":[
            {
               "value":[
                  {
                     "letter":"N",
                     "index":0
                  },
                  {
                     "letter":"e",
                     "index":1
                  },
                  {
                     "letter":"w",
                     "index":2
                  }
               ],
               "onclick":"CreateNewDoc()"
            },
            {
               "value":[
                  {
                     "letter":"O",
                     "index":0
                  },
                  {
                     "letter":"p",
                     "index":1
                  },
                  {
                     "letter":"e",
                     "index":2
                  },
                  {
                     "letter":"n",
                     "index":3
                  }
               ],
               "onclick":"OpenDoc()"
            },
            {
               "value":[
                  {
                     "letter":"C",
                     "index":0
                  },
                  {
                     "letter":"l",
                     "index":1
                  },
                  {
                     "letter":"o",
                     "index":2
                  },
                  {
                     "letter":"s",
                     "index":3
                  },
                  {
                     "letter":"e",
                     "index":4
                  }
               ],
               "onclick":"CloseDoc()"
            }
         ]
      }
   }
}
```


### Map

- `.map({String}, {Function(value, index, array)})`

`.map` is a convenience method, equivalent to running `.map` or `_.map` on the returned
array from a `.get`. Roam's `.map` is significantly faster than JavaScript's native `.map`,
and roughly equivalent to lodash's `_.map`. For details on how a map function works, see
the documentation for [map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map).

```javascript
roam(json).map('*value', function(val) {
  return val.toUpperCase();
});
```
Returns:
```json
[
  "FILE",
  "NEW",
  "OPEN",
  "CLOSE"
]
```

### Filter

- `.filter({String}, {Function(value, index, array)})`

`.filter` is a convenience method in the same vein as map, and shares its performance characteristics.
For details on how a filter function works, see the documentation for [filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter).

```javascript
roam(json).filter('*value', function(val) {
  return val.slice(-1) === 'e';
});
```
Returns:
```json
[
  "File",
  "Close"
]
```

##### A note on map and filter
Neither map nor filter support binding a custom value to `this` within the callback.

### Utilities

#### Distinct

- `.distinct({String})`

`.distinct` is a wrapper around `.filter` and will return unique values.

#### Count

- `.count({String})`

`.count` is a wrapper around `.get` and will return the number of matched elements.

#### Has

- `.has({String})`

`.has` is a wrapper around `.one` and will return true or false depending on whether a match
could be found.
