# KPM-API

KPM-API is an [ExpressJS][0] middleware for implementing the API required for a Kerbal Package Manager repository.

## Installation

Install through `npm` like so:

`npm install kpm-api --save`

## Package Usage

**Example:**

```js
var express = require('express'),
	kpmApi = require('kpm-api'),
	app = express();

app.use(kpmApi.packages({
    list: function(page, size, callback) {
        // code to retrieve a list of available packages.
		// pass result to callback when done.
		callback([]);
    },
    
    fetch: function(id, version, callback) {
        // code to retrieve a stream or buffer for the
		// specified package and version. pass result to
		// callback when done.
		callback(null); // package not found. 
    },
    
    exists: function(id, version, callback) {
        // code to determine whether specified package exists.
		// return result (either true or false) to callback.
		callback(false);
    }
});
```

## Owner API Usage

**Example**

```js
app.use(kpmApi.owner({
    add: function(client, name, callback) {
        
    },

    remove: function(client, name, callback) {
        
    },

    list: function(client, callback) {
        
    }
}));
```

## Options

**list** (required) - A handler for listing available packages in the repository. Takes an index for the page requested(`page`), the page size(`size`), and a callback(`callback`) for returning the result. 

- `size` will be `-1` if not specified. This would mean paging is not active.
- `callback` expects an `Array`.
- `callback` will return an empty `Array` if the result is `null` or `undefined`.
- `page` is zero-based.

**fetch** (required) - a handler for retrieving a package. Takes a package `id`, `version`, and `callback` for returning the result.

- `version` may be blank. This means the latest version available.
- `callback` expects a readable `stream` or `Buffer`.
- a `null` or `undefined` result means the package was not found and the server will respond with 404.
- if the result is not a `stream` or `Buffer`, the middleware will pass an error to the next middleware.

**exists** (required) - a handler for determining if a package is available within the repository. Like **fetch**, it takes an `id`, `version`, and `callback`.

- `version` may be blank. This means the latest version available.
- `callback` expects either `true` or `false`.  

## Bugs and Feedback

If you see a bug or have a suggestion, feel free to create an issue [here][2].

## License

MIT License. Copyright 2014 Daniel Krainas [http://www.danielkrainas.com][1]

[0]: http://expressjs.com/
[1]: http://www.danielkrainas.com
[2]: https://github.com/danielkrainas/kpm-api/issues