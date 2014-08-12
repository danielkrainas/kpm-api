var stream = require('stream');

module.exports = exports = {

    packages: function (options) {
        var packageListPath = '/p';
        var packagesPath = '/p/';
        if (!options.fetch || typeof options.fetch !== 'function') {
            throw new Error('fetch handler must be a function');
        } else if (!options.list || typeof options.list !== 'function') {
            throw new Error('list handler must be a function');
        } else if (!options.exists || typeof options.exists !== 'function') {
            throw new Error('exists handler must be a function');
        }

        return function (req, res, next) {
            if (req.path == packageListPath) {
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
                var id = req.path.substring(packagesPath.length);
                if (!id) {
                    res.send(404);
                }

                var version = req.query.v || '';
                if (req.method == 'HEAD') {
                    options.exists(id, version, function (exists) {
                        res.send(exists ? 200 : 404);
                    });

                } else if (req.method == 'GET') {
                    options.fetch(id, version, function (result) {
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

                        if (error) next(new Error('kpr: unsupported result given for fetch: ' + id + '@' + version));
                    });

                } else next();

            } else next();
        };
    },


    owner: function (options) {
        return function (req, res, next) {
            next();
        };
    }
};