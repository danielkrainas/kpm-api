var chai = require('chai'),
    expect = chai.expect,
    kpm = require('../../index'),
    ownerApi = kpm.owner;

describe('Owner API:', function () {
    var options, req, res, basePath = '/o/';

    var apiWrapper = function(o) {
        return function() {
            ownerApi(o);
        };
    };

    beforeEach(function () {
        options = {
            add: function () { },
            remove: function () { },
            list: function () { }
        };
    });

    describe('Basics', function () {
        beforeEach(function () {
            req = {
                path: '/',
                method: 'GET',
                get: function() {
                    return null;
                }
            };

            res = {
                send: function () { }
            };
        });

        it('should return middleware', function () {
            var ware = ownerApi(options);
            expect(ware).to.exist;
            expect(ware).to.be.a('function');
            expect(ware.length).to.equal(3);
        });

        it('should passthrough if unrecognized path', function (done) {
            req.path = '/foo/';
            ownerApi(options)(req, res, function () {
                done();
            });
        });
    });

    describe('Options', function () {

        it('should require add handler', function () {
            options.add = null;

            expect(apiWrapper(options)).to.throw();
        });

        it('should require remove handler', function() {
            options.remove = null;

            expect(apiWrapper(options)).to.throw();
        });

        it('should require list handler', function() {
            options.list = null;

            expect(apiWrapper(options)).to.throw();
        });

        it('should require add to be a function', function() {
            options.add = 'add';
            expect(apiWrapper(options)).to.throw();
            
            options.add = 1;
            expect(apiWrapper(options)).to.throw();
            
            options.add = [1,2];
            expect(apiWrapper(options)).to.throw();
        });

        it('should require remove to be a function', function() {
            options.remove = 'remove';
            expect(apiWrapper(options)).to.throw();
            
            options.remove = 1;
            expect(apiWrapper(options)).to.throw();
            
            options.remove = [1,2];
            expect(apiWrapper(options)).to.throw();
        });

        it('should require list to be a function', function() {
            options.list = 'list';
            expect(apiWrapper(options)).to.throw();
            
            options.list = 1;
            expect(apiWrapper(options)).to.throw();
            
            options.list = [1,2];
            expect(apiWrapper(options)).to.throw();
        });
    });

    describe('List Handler', function() {
        var verified = true;

        beforeEach(function() {
            req = {
                path: '/o/foo',
                method: 'GET',
                get: function(h) {
                    if(h == 'x-kpm-key') {
                        return '123';
                    }
                }
            };
            
            res = {
                send: function() {}
            };

            kpm.verifyKey(function(client, callback) {
                callback(verified);
            });
        });

        it('should return empty list when result is null', function(done) {
            options.list = function(pkg, client, callback) {
                callback(null);
            };

            res.send = function(status, data) {
                expect(status).to.equal(200);
                expect(data).to.have.length(0);
                done();
            };

            ownerApi(options)(req, res, null);
        });

        it('should return 404 if the package id is null', function(done) {
            req.path = basePath;
            res.send = function(status) {
                expect(status).to.equal(404);
                done();
            };

            ownerApi(options)(req, res, null);
        });
    });

    describe('Add Handler', function() {
        var verified = true;

        beforeEach(function() {
            req = {
                path: '/o/foo',
                method: 'POST',
                body: {
                    user: 'foo'
                },
                get: function(h) {
                    if(h == 'x-kpm-key') {
                        return '123';
                    }
                }
            };
            
            res = {
                send: function() {}
            };

            kpm.verifyKey(function(client, callback) {
                callback(verified);
            });

            verified = true;
        });

        it('should return 404 if package id is null', function(done) {
            req.path = basePath;
            res.send = function(status) {
                expect(status).to.equal(404);
                done();
            };

            ownerApi(options)(req, res, null);            
        });

        it('should return 404 if result is null', function(done) {
            options.add = function(pkg, client, user, callback) {
                callback(null);
            };

            res.send = function(status) {
                expect(status).to.equal(404);
                done();
            };

            ownerApi(options)(req, res, null);
        });

        it('should return 404 if result is false', function(done) {
            options.add = function(pkg, client, user, callback) {
                callback(false);
            };

            res.send = function(status) {
                expect(status).to.equal(404);
                done();
            };

            ownerApi(options)(req, res, null);
        });

        it('should return 204 if result is truthy', function(done) {
            options.add = function(pkg, client, user, callback) {
                callback(1);
            };

            res.send = function(status) {
                expect(status).to.equal(204);
                done();
            };

            ownerApi(options)(req, res, null);
        });

        it('should return 403 if key is not verified', function(done) {
            verified = false;
            res.send = function(status) {
                expect(status).to.equal(403);
                done();
            };

            ownerApi(options)(req, res, null);
        });

        it('should return 400 if user is not supplied', function(done) {
            req.body.user = null;
            res.send = function(status) {
                expect(status).to.equal(400);
                done();
            };

            ownerApi(options)(req, res, null);
        });

        it('should passthrough if request is not a POST', function(done) {
            req.method = 'PUT';
            ownerApi(options)(req, res, function() {
                done();
            });
        });
    });

    describe('Remove Handler', function() {
        var verified = true;

        beforeEach(function() {
            req = {
                path: '/o/foo',
                method: 'DELETE',
                body: {
                    user: 'foo'
                },
                get: function(h) {
                    if(h == 'x-kpm-key') {
                        return '123';
                    }
                }
            };
            
            res = {
                send: function() {}
            };

            kpm.verifyKey(function(client, callback) {
                callback(verified);
            });

            verified = true;
        });

        it('should return 404 if package id is null', function(done) {
            req.path = basePath;
            res.send = function(status) {
                expect(status).to.equal(404);
                done();
            };

            ownerApi(options)(req, res, null);            
        });

        it('should return 404 if result is null', function(done) {
            options.remove = function(pkg, client, user, callback) {
                callback(null);
            };

            res.send = function(status) {
                expect(status).to.equal(404);
                done();
            };

            ownerApi(options)(req, res, null);
        });

        it('should return 404 if result is false', function(done) {
            options.remove = function(pkg, client, user, callback) {
                callback(false);
            };

            res.send = function(status) {
                expect(status).to.equal(404);
                done();
            };

            ownerApi(options)(req, res, null);
        });

        it('should return 204 if result is truthy', function(done) {
            options.remove = function(pkg, client, user, callback) {
                callback(1);
            };

            res.send = function(status) {
                expect(status).to.equal(204);
                done();
            };

            ownerApi(options)(req, res, null);
        });

        it('should return 403 if key is not verified', function(done) {
            verified = false;
            res.send = function(status) {
                expect(status).to.equal(403);
                done();
            };

            ownerApi(options)(req, res, null);
        });

        it('should return 400 if user is not supplied', function(done) {
            req.body.user = null;
            res.send = function(status) {
                expect(status).to.equal(400);
                done();
            };

            ownerApi(options)(req, res, null);
        });

        it('should passthrough if request is not a DELETE', function(done) {
            req.method = 'PUT';
            ownerApi(options)(req, res, function() {
                done();
            });
        });
    });
});