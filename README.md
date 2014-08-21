# KPM-API

KPM-API is a set of Connect middleware for implementing the API required to host a KSP Packaged Module repository. 

The API has several sub components that can be individually implemented:

- **Configuration** - A way to expose the capabilities of the repository to clients.
- **Packages** - The consumption end of the API and is expected to be supported.
- **Publishing** - Allows creators to submit their modules to the repository.
- **Owner** - Allows project owners to distribute control over a package .  

## Installation

Install through `npm` like so:

`npm install kpm-api --save`

## Feature: Configuration

If you wish to mount the middleware on endpoints different from the defaults or wish to only implement certain API's, you can use the `config` middleware to make the clients aware. The middleware serves a file(`/kpm-config.json`) that is requested by the kpm client to determine the repository capabilities and conventions. 

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

## Feature: Packages

This feature handles requests for retrieving and searching for packages. 

### Example

```js
var express = require('express'),
	kpm = require('kpm-api'),
	app = express();

app.use(kpm.packages({
    list: function (pageIndex, pageSize, client, callback) {
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

**list** - A handler for listing available packages in the repository. 

- `pageSize` will be `-1` if not specified. This would mean paging is not active.
- `callback` expects an `Array`.
- `callback` will return an empty `Array` if the result is `null` or `undefined`.
- `pageIndex` is zero-based.

**fetch** - a handler for retrieving a package.

- `callback` expects a `stream.Readable`, `Buffer`, or `String`.
- a `String` result will cause a redirection to the url in the `String`.
- a `null` or `undefined` result means the package was not found and the server will respond with 404.
- if the result is not a `stream` or `Buffer`, the middleware will pass an error to the next middleware.

**exists** - a handler for determining if a package is available within the repository. Like **fetch**, it takes a `pkg` object, `client` object, and `callback`.

- `callback` expects either `true` or `false`.

## Feature: Owners

This feature is responsible for adjusting and displaying what users can publish a specific package to the repository. It is meant to allow users to manipulate publishing rights on a repository from the client. The rights granted at this time are all or nothing. A user with owner rights to a repository can publish new versions of the package to the repository. 

### Example

```js
var express = require('express'),
	kpm = require('kpm-api'),
	app = express();

app.use(kpm.owner({
    add: function(pkg, client, userName, callback) {
        
    },

    remove: function(pkg, client, userName, callback) {
        
    },

    list: function(pkg, client, callback) {
        
    }
}));
```

### Options

**add** - a handler for adding a user to a package's owner list.

- `callback` expects either `true` or `false` to indicate success.

**remove** - a handler for removing a user from a package's owner list.

- `callback` expects either `true` or `false` to indicate success.

**list** - a handler to list owners of a package.

- `callback` expects an `Array`.
- `callback` will return an empty `Array` if the result is `null` or `undefined`.

## Feature: Publishing

This feature allows users to publish/unpublish packages to the repository from the KPM client.  

### Example
**Example**

```js
var express = require('express'),
	kpm = require('kpm-api'),
	app = express();

app.use(kpm.publishing({
    publish: function (pkg, client, stream, callback) {

    },

    unpublish: function (pkg, client, callback) {

    },

	uploadResolver: function(req, fieldName) {
		
	}
}));
```

### Options

**publish** - a handler to adding the package to the repository. Takes a `pkg` object, a `client` object, `stream` object, and a `callback` for returning the result.

- `callback` expects either `true` or `false` to indicate success.  

**unpublish** (optional) - a handler for removing the package from the repository. Takes `pkg` object, `client` object, and a `callback` for returning the result.

- `callback` expects either `true` or `false` to indicate success.

**uploadResolver** (optional)- a handler that resolves the package stream from the current request. It takes the current request(`req`) and the name(`fieldName`) of the field where the package stream should be located. This is a synchronous call and expects a return value to be the resolved stream of the package. A default implementation is provided if not specified which looks in `req.files` for the file stream.

- the returned value must be an instance of `stream.Readable` to be used by the middleware. 

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

## Types

### Client

Read-Only Information related to the KPM client responsible for the current API request.

#### Usage

```js
var Client = require('kpm-api').Client;

var client = new Client(/* request object */);
```

#### Members

- **id**: String | Null - the user-agent string of the KPM client. May be empty if not provided.
- **version**: String | Null - the version of the KPM client. May be null if not provided.
- **key**: String | Null - the API key provided by the client. May be null if not provided.

##

### Package

#### Usage

```js
var Package = require('kpm-api').Package;

var pkg = new Package(id, version);
```

#### Members

- **id**: String | Null - the id of the package. May be null if the id was not provided by the request.
- **version**: String | Null - the version of the package. An empty string implies the latest version.

## Bugs and Feedback

If you see a bug or have a suggestion, feel free to create an issue [here][2].

## License

MIT License. Copyright 2014 Daniel Krainas [http://www.danielkrainas.com][1]

[0]: http://expressjs.com/
[1]: http://www.danielkrainas.com
[2]: https://github.com/danielkrainas/kpm-api/issues