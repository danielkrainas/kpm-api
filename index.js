var stream = require('stream');

var privateVerifier = null;

var keyVerifier = function (client, callback) {
    if (!privateVerifier) {
        throw new Error('no key verifier was provided.');
    }

    privateVerifier(client, callback);
};

var isFunction = function (fn) {
    return (fn && typeof fn === 'function');
};

var Client = function (req) {
    this.id = req.get('x-kpm-agent') || '';
    this.version = req.get('x-kpm-version') || null;
    this.key = req.get('x-kpm-key') || null;
};

var Package = function (id, version) {
    $this = this;
    this.id = id || null;
    this.version = version || '';
};

Package.fromPath = function (path, start, hasVersion) {
    var pkg = new Package();
    path = path.substring(start);
    var end = path.indexOf('/');
    if (end <= 0) {
        end = null;
    }

    pkg.id = end ? path.substring(0, end) : path;
    if (end && hasVersion) {
        pkg.version = path.substring(end + 1);
    } else {
        pkg.version = '';
    }

    return pkg;
};

Package.prototype.toString = function () {
    return this.id + '@' + this.version;
};

module.exports = exports = {

    Package: Package,


    Client: Client,


    packages: function (options) {
        var listPath = '/p';
        var packagesPath = '/p/';
        if (!isFunction(options.fetch)) {
            throw new Error('fetch handler must be a function');
        } else if (!isFunction(options.list)) {
            throw new Error('list handler must be a function');
        } else if (!isFunction(options.exists)) {
            throw new Error('exists handler must be a function');
        }

        return function (req, res, next) {
            var client = new Client(req);
            if (req.path == listPath) {
                if (req.method == 'GET') {
                    var page = req.query.page || 0;
                    var size = req.query.size || -1;
                    options.list(page, size, function (list) {
                        res.send(200, list || []);
                    });

                } else {
                    next();
                }
            } else if (req.path.indexOf(packagesPath) === 0) {
                var pkg = Package.fromPath(req.path, packagesPath.length, true);
                if (!pkg.id) {
                    res.send(404);
                }

                if (req.method == 'HEAD') {
                    options.exists(pkg, client, function (exists) {
                        res.send(exists ? 200 : 404);
                    });

                } else if (req.method == 'GET') {
                    options.fetch(pkg, client, function (result) {
                        var error = false;
                        if (!result) {
                            res.send(404);
                        } else if (result instanceof Buffer) {
                            res.send(200, result);
                        } else if (result instanceof stream.Readable) {
                            res.status(200);
                            result.pipe(res);
                        } else if (typeof result === 'object') {
                            error = true;
                        } else if (typeof result === 'string') {
                            res.redirect(302, result);
                        } else {
                            error = true;
                        }

                        if (error) next(new Error('kpr: unsupported result given for fetch: ' + pkg.toString()));
                    });

                } else next();

            } else next();
        };
    },


    owner: function (options) {
        var basePath = '/o/';
        if (!isFunction(options.add)) {
            throw new Error('add handler must be a function');
        } else if (!isFunction(options.list)) {
            throw new Error('list handler must be a function');
        } else if (!isFunction(options.remove)) {
            throw new Error('remove handler must be a function');
        }

        return function (req, res, next) {
            if (req.path.indexOf(basePath) === 0) {
                var client = new Client(req);
                var pkg = Package.fromPath(req.path, basePath.length, false);
                if (!pkg.id) {
                    res.send(404);
                    return;
                }

                if (req.method == 'GET') {
                    options.list(pkg, client, function (result) {
                        res.send(200, result || []);
                    });
                } else {
                    var user = req.body.user;
                    if (!user || !user.length) {
                        res.send(400);
                    } else if (req.method == 'DELETE' || req.method == 'POST') {
                        keyVerifier(client, function (verified) {
                            if (verified) {
                                if (req.method == 'DELETE') {
                                    options.remove(pkg, client, user, function (result) {
                                        res.send(result ? 204 : 404);
                                    });
                                } else if (req.method == 'POST') {
                                    options.add(pkg, client, user, function (result) {
                                        res.send(result ? 204 : 404);
                                    });
                                }
                            } else {
                                res.send(403);
                            }
                        });
                    } else {
                        next();
                    }
                }
            } else {
                next();
            }
        };
    },


    verifyKey: function (handler) {
        if (!handler || typeof handler !== 'function') {
            throw new Error('handler must be a function');
        }

        privateVerifier = handler;
    }
};