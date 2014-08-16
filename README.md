# KPM-API

KPM-API is a Connect middleware for implementing the API required to host a Kerbal Packaged Module repository. 

The API has several sub components that can be individually implemented:

- **Packages** - The consumption end of the API and is expected to be supported.
- **Publishing** - Allows creators to submit their modules to the repository.
- **Owner** - Allows project owners to distribute control over a package .  

## Installation

Install through `npm` like so:

`npm install kpm-api --save`

## API Configuration File

If you wish to host your API endpoints on paths different from the default or wish to only implement certain API's, you can use the `config` middleware to make the clients aware. The middleware serves a file(`/kpm-config.json`) that is requested by the kpm client to determine the repository capabilities and conventions. 

### Example

```js
app.use(kpm.config({
    packages: '/p',
    owner: false,
    publishing: false
}));
```

### Options

- **packages** - _packages_ API feature endpoint path. By default, the path is set to `/p`.

- **owner** - _owner_ API feature endpoint path. By default, this feature is disabled.

- **publishing** - _publishing_ API feature endpoint path. By default, this feature is disabled.

**Note 1**: All paths are relative to the host. Absolute URI's are not allowed.
 
**Note 2**: A `false` value indicates that feature is not available on this registry.

## Key Verification

The _owner_ and _publishing_ features require a handler to verify client requests. This handler can be specified using the `verifyKey` function.

### Usage

```js
require('kpm-api').verifyKey(function (key, callback) { /* ... */ });
```

### Example

```js
var kpm = require('kpm-api');

kpm.verifyKey(function (key, callback) {
    // verify key provided
	callback(true || false);
});
```

### Parameters

**handler** - the handler will be passed a `key` and a `callback`. After verifying the key, the result should be passed to `callback` as a boolean (`true` or `false`).

## Packages Feature

This endpoint handles requests for retrieving and searching for packages. 

### Example

```js
var express = require('express'),
	kpm = require('kpm-api'),
	app = express();

app.use(kpm.packages({
    list: function (page, size, client, callback) {
        // code to retrieve a list of available packages.
		// pass result to callback when done.
		callback([]);
    },
    
    fetch: function (pkg, client, callback) {
        // code to retrieve a stream or buffer for the
		// specified package and version. pass result to
		// callback when done.
		callback(null); // package not found. 
    },
    
    exists: function (pkg, client, callback) {
        // code to determine whether specified package exists.
		// return result (either true or false) to callback.
		callback(false);
    }
});
```

### Options

**list** - A handler for listing available packages in the repository. Takes an index for the page requested(`page`), the page size(`size`), the client object(`client`), and a callback(`callback`) for returning the result. 

- `size` will be `-1` if not specified. This would mean paging is not active.
- `callback` expects an `Array`.
- `callback` will return an empty `Array` if the result is `null` or `undefined`.
- `page` is zero-based.

**fetch** - a handler for retrieving a package. Takes a `pkg` object, `client` object, and a `callback` for returning the result.

- `callback` expects a readable `stream`, `Buffer`, or string.
- a string result will cause a redirection to the url provided to the callback.
- a `null` or `undefined` result means the package was not found and the server will respond with 404.
- if the result is not a `stream` or `Buffer`, the middleware will pass an error to the next middleware.

**exists** - a handler for determining if a package is available within the repository. Like **fetch**, it takes a `pkg` object, `client` object, and `callback`.

- `callback` expects either `true` or `false`.

## Owner API Usage

**Example**

```js
var express = require('express'),
	kpm = require('kpm-api'),
	app = express();

app.use(kpm.owner({
    add: function(pkg, client, name, callback) {
        
    },

    remove: function(pkg, client, name, callback) {
        
    },

    list: function(pkg, client, callback) {
        
    }
}));
```

### Options

**add** - A handler for listing available packages in the repository. Takes an index for the page requested(`page`), the page size(`size`), and a callback(`callback`) for returning the result. 

- `size` will be `-1` if not specified. This would mean paging is not active.
- `callback` expects an `Array`.
- `callback` will return an empty `Array` if the result is `null` or `undefined`.
- `page` is zero-based.

**remove** - a handler for retrieving a package. Takes a package `id`, `version`, and `callback` for returning the result.

- `version` may be blank. This means the latest version available.
- `callback` expects a readable `stream` or `Buffer`.
- a `null` or `undefined` result means the package was not found and the server will respond with 404.
- if the result is not a `stream` or `Buffer`, the middleware will pass an error to the next middleware.

**list** - a handler for determining if a package is available within the repository. Like **fetch**, it takes an `id`, `version`, and `callback`.

- `version` may be blank. This means the latest version available.
- `callback` expects either `true` or `false`.  

## Publishing API Usage

**Example**

```js
var express = require('express'),
	kpm = require('kpm-api'),
	app = express();

app.use(kpm.publishing({
    publish: function (pkg, stream, client, callback) {

    },

    unpublish: function (pkg, client, callback) {

    },

	uploadResolver: function(req, fieldName) {
		
	}
}));
```

### Options

**publish** - A handler for listing available packages in the repository. Takes a `pkg` object, `client` object, and a `callback` for returning the result.

- `size` will be `-1` if not specified. This would mean paging is not active.
- `callback` expects an `Array`.
- `callback` will return an empty `Array` if the result is `null` or `undefined`.
- `page` is zero-based.

**unpublish** (optional) - a handler for retrieving a package. Takes a package `id`, `version`, and `callback` for returning the result.

- `version` may be blank. This means the latest version available.
- `callback` expects a readable `stream` or `Buffer`.
- a `null` or `undefined` result means the package was not found and the server will respond with 404.
- if the result is not a `stream` or `Buffer`, the middleware will pass an error to the next middleware.

**uploadResolver** (optional)- a handler for determining if a package is available within the repository. Like **fetch**, it takes an `id`, `version`, and `callback`.

- `version` may be blank. This means the latest version available.
- `callback` expects either `true` or `false`.  

## Bugs and Feedback

If you see a bug or have a suggestion, feel free to create an issue [here][2].

## License

MIT License. Copyright 2014 Daniel Krainas [http://www.danielkrainas.com][1]

[0]: http://expressjs.com/
[1]: http://www.danielkrainas.com
[2]: https://github.com/danielkrainas/kpm-api/issues