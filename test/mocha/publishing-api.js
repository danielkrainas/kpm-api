var chai = require('chai'),
    Readable = require('stream').Readable,
    util = require('util'),
    expect = chai.expect,
    kpm = require('../../index'),
    publishApi = kpm.publishing;

var TestStream = function() {
    
};

util.inherits(TestStream, Readable);

describe('Publishing API:', function () {
    var options, req, res, basePath = '/p/';

    var apiWrapper = function(o) {
        return function() {
            publishApi(o);
        };
    };

    beforeEach(function () {
        options = {
            publish: function () { },
            unpublish: function () { },
            uploadResolver: function(req, name) {
                return new TestStream();
            }
        };
    });

    describe('Basics', function () {
        beforeEach(function () {
            req = {
                path: '/',
                method: 'POST',
                get: function() {
                    return null;
                }
            };

            res = {
                send: function () { }
            };
        });

        it('should return middleware', function () {
            var ware = publishApi(options);
            expect(ware).to.exist;
            expect(ware).to.be.a('function');
            expect(ware.length).to.equal(3);
        });

        it('should passthrough if unrecognized path', function (done) {
            req.path = '/foo/';
            publishApi(options)(req, res, function () {
                done();
            });
        });

        it('should passthrough if method not PUT or DELETE', function (done) {
            req.method = 'HEAD';
            publishApi(options)(req, res, function () {
                done();
            });
        });
    });

    describe('Options', function () {

        it('should require publish handler', function () {
            options.publish = null;

            expect(apiWrapper(options)).to.throw();
        });

        it('should NOT require unpublish handler', function () {
            options.unpublish = null;

            expect(apiWrapper(options)).to.not.throw();
        });

        it('should require publish to be a function', function() {
            options.publish = 'publish';
            expect(apiWrapper(options)).to.throw();
            
            options.publish = 1;
            expect(apiWrapper(options)).to.throw();
            
            options.publish = [1,2];
            expect(apiWrapper(options)).to.throw();
        });

        it('should require unpublish to be a function', function() {
            options.unpublish = 'unpublish';
            expect(apiWrapper(options)).to.throw();
            
            options.unpublish = 1;
            expect(apiWrapper(options)).to.throw();
            
            options.unpublish = [1,2];
            expect(apiWrapper(options)).to.throw();
        });
        
        it('should require uploadResolver to be a function', function() {
            options.uploadResolver = 'uploadResolver';
            expect(apiWrapper(options)).to.throw();
            
            options.uploadResolver = 1;
            expect(apiWrapper(options)).to.throw();
            
            options.uploadResolver = [1,2];
            expect(apiWrapper(options)).to.throw();
        });
    });

    describe('Publish Handler', function() {
        var verified = true;

        beforeEach(function() {
            req = {
                path: '/p/foo',
                method: 'PUT',
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
            req.path = '/p/';
            res.send = function(status) {
                expect(status).to.equal(404);
                done();
            };

            publishApi(options)(req, res, null);
        });

        it('should return 403 if not verified', function(done) {
            verified = false;
            res.send = function(status) {
                expect(status).to.equal(403);
                done();
            };

            publishApi(options)(req, res, null);
        });

        it('should require upload result be a readable stream', function(done) {
            options.uploadResolver = function() {
                return {};
            };

            publishApi(options)(req, res, function(err) {
                expect(err).to.exist;
                expect(err).to.be.an.instanceof(Error);
                done();
            });
        });

        it('should return 201 on truthy publish result', function(done) {
            res.send = function(status) {
                expect(status).to.equal(201);
                done();
            };

            options.publish = function(pkg, client, stream, callback) {
                callback(1);
            };

            publishApi(options)(req, res, null);
        });

        it('should return 400 on false publish result', function(done) {
            res.send = function(status) {
                expect(status).to.equal(400);
                done();
            };

            options.publish = function(pkg, client, stream, callback) {
                callback(false);
            };

            publishApi(options)(req, res, null);
        });

        it('should passthrough when not a PUT request', function(done) {
            req.method = 'GET';

            publishApi(options)(req, res, function() {
                done();
            });
        });
    });

    describe('Unpublish Handler', function() {
        var verified = true;

        beforeEach(function() {
            req = {
                path: '/p/foo',
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

        it('should passthrough when not a DELETE request', function(done) {
            req.method = 'GET';

            publishApi(options)(req, res, function() {
                done();
            });
        });

        it('should return 403 if not verified', function(done) {
            verified = false;
            res.send = function(status) {
                expect(status).to.equal(403);
                done();
            };

            publishApi(options)(req, res, null);
        });

        it('should return 200 on truthy result', function(done) {
            res.send = function(status) {
                expect(status).to.equal(200);
                done();
            };

            options.unpublish = function(pkg, client, callback) {
                callback(1);
            };

            publishApi(options)(req, res, null);
        });

        it('should return 400 on false result', function(done) {
            res.send = function(status) {
                expect(status).to.equal(400);
                done();
            };

            options.unpublish = function(pkg, client, callback) {
                callback(false);
            };

            publishApi(options)(req, res, null);
        });

        it('should return 405 if handler is not supplied', function(done) {
            options.unpublish = null;
            res.send = function(status) {
                expect(status).to.equal(405);
                done();
            };

            publishApi(options)(req, res, null);
        });
    });
});