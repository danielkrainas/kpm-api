var sinon = require('sinon'),
       chai = require('chai'),
       Readable = require('stream').Readable,
       util = require('util'),
       expect = chai.expect,
       kpmApi = require('../../index');

describe('API:', function() {
    var options, req, res, next;
    
    var kpmApiWrapper = function(options) {
        return function() {
            kpmApi(options);
        };
    };

    beforeEach(function() {
        options = {
            list: function() {},
            fetch: function() {},
            exists: function() {}
        };
    });

    describe('Basics', function() {
        beforeEach(function() {
            req = {
                path: '/',
                method: 'GET',
                query: {}
            };
            
            res = {
                send: function() {}
            };
        });
        
        it('should return middleware', function() {
            var ware = kpmApi(options);
            expect(ware).to.exist;
            expect(ware).to.be.a('function');
            expect(ware.length).to.equal(3);
        });
        
        it('should passthrough if unrecognized path', function(done) {
            req.path = '/foo/';
            kpmApi(options)(req, res, function() {
                done();
            });
        });
    });

    describe('Options', function() {
        it('should require list handler', function() {
            options.list = null;

            expect(kpmApiWrapper(options)).to.throw();
        });
        
        it('should require fetch handler', function() {
            options.fetch = null;
            
            expect(kpmApiWrapper(options)).to.throw();
        });
        
        it('should require exists handler', function() {
            options.exists = null;
            
            expect(kpmApiWrapper(options)).to.throw();
        });
        
        it('should require list to be a function', function() {
            options.list = 'list';
            expect(kpmApiWrapper(options)).to.throw();
            
            options.list = 1;
            expect(kpmApiWrapper(options)).to.throw();
            
            options.list = [1,2];
            expect(kpmApiWrapper(options)).to.throw();
        });
        
        it('should require fetch to be a function', function() {
            options.fetch = 'fetch';
            expect(kpmApiWrapper(options)).to.throw();
            
            options.fetch = 1;
            expect(kpmApiWrapper(options)).to.throw();
            
            options.fetch = [1,2];
            expect(kpmApiWrapper(options)).to.throw();
        });
        
        it('should require exists to be a function', function() {
            options.exists = 'exists';
            expect(kpmApiWrapper(options)).to.throw();
            
            options.exists = 1;
            expect(kpmApiWrapper(options)).to.throw();
            
            options.exists = [1,2];
            expect(kpmApiWrapper(options)).to.throw();
        });
    });
    
    describe('List Handler', function() {
        beforeEach(function() {
            req = {
                path: '/p',
                method: 'GET',
                query: {}
            };
            
            res = {
                send: function() {}
            };
        });
        
        it('should default page to 0 when not specified', function(done) {
            options.list = function(page) {
                expect(page).to.equal(0);
                done();
            };
            
            kpmApi(options)(req, res, next);
        });
        
        it('should default page size to -1 when not specified', function(done) {
            options.list = function(page, size) {
                expect(size).to.equal(-1);
                done();
            };
            
            kpmApi(options)(req, res, next);
        });
        
        it('should return empty list when result is null', function(done) {
            options.list = function(page, size, callback) {
                callback(null);
            };
            
            res.send = function(status, data) {
                expect(data).to.be.empty;
                expect(status).to.equal(200);
                done();
            };
            
            kpmApi(options)(req, res, next);
        });
        
        it('should passthrough if not a GET request', function(done) {
            req.method = 'PUT';
            
            kpmApi(options)(req, res, function() {
                done();
            });
        });
        
        it('should recongize page when specified', function(done) {
            req.query.page = 1;
            options.list = function(page) {
                expect(page).to.equal(1);
                done();
            };
            
            kpmApi(options)(req, res, next);
        });
        
        it('should recognize page size when specified', function(done) {
            req.query.size = 4;
            options.list = function(page, size) {
                expect(size).to.equal(4);
                done();
            };
            
            kpmApi(options)(req, res, next);
        });
    });
    
    describe('Package Handler', function() {
        var stream, TestStream = function() {
        };
        
        util.inherits(TestStream, Readable);
        beforeEach(function() {
            req = {
                path: '/p/foo',
                basePath: '/p/',
                method: 'GET',
                query: {}
            };
            
            res = {
                send: function() {}
            };
            
            stream = new TestStream();
            stream.pipe = function() {};
        });
        
        it('should recognize id', function(done) {
            options.fetch = function(id) {
                expect(id).to.equal('foo');
                done();
            };
            
            kpmApi(options)(req, res, next);
        });
        
        it('should recognize id with hyphen', function(done) {
            req.path = req.basePath + 'foo-bar';
            options.fetch = function(id) {
                expect(id).to.equal('foo-bar');
                done();
            };
            
            kpmApi(options)(req, res, next);
        });
        
        it('should recognize version', function(done) {
            req.query.v = '1.0.0';
            options.fetch = function(id, version) {
                expect(version).to.equal('1.0.0');
                done();
            };
            
            kpmApi(options)(req, res, next);
        });
        
        it('should default version to an empty string when not specified', function(done) {
            options.fetch = function(id, version) {
                expect(version).to.be.empty;
                done();
            };
            
            kpmApi(options)(req, res, next);
        });
        
        it('should return 404 if id is null', function(done) {
            req.path = req.basePath;
            res.send = function(status) {
                expect(status).to.equal(404);
                done();
            };
            
            kpmApi(options)(req, res, next);
        });
        
        it('should return 404 if result is null', function(done) {
            options.fetch = function(id, version, callback) {
                callback(null);
            };
            
            res.send = function(status) {
                expect(status).to.equal(404);
                done();
            };
            
            kpmApi(options)(req, res, next);
        });
        
        it('should allow buffer result', function(done) {
            var buffer = new Buffer(0);
            options.fetch = function(id, version, callback) {
                callback(buffer);
            };
            
            res.send = function(status, data) {
                expect(data).to.equal(buffer);
                done();
            };
            
            kpmApi(options)(req, res, next);
        });

        it('should allow stream result', function(done) {
            res.status = function() {};
            options.fetch = function(id, version, callback) {
                callback(stream);
            };
            
            stream.pipe = function(response) {
                expect(response).to.equal(res);
                done();
            };
            
            kpmApi(options)(req, res, next);
        });

        it('should allow string result', function(done) {
            var dest = 'http://tempuri.org/foo';
            options.fetch = function(id, version, callback) {
                callback(dest);
            };

            res.redirect = function(status, location) {
                expect(location).to.equal(dest);
                done();
            };

            kpmApi(options)(req, res, next);
        });

        it('should return 302 when result is a string', function(done) {
            var dest = 'http://tempuri.org/foo';
            options.fetch = function(id, version, callback) {
                callback(dest);
            };

            res.redirect = function(status, location) {
                expect(status).to.equal(302);
                done();
            };

            kpmApi(options)(req, res, next);
        });

        it('should return 200 when result is a stream', function(done) {
            options.fetch = function(id, version, callback) {
                callback(stream);
            };
            
            res.status = function(status) {
                expect(status).to.equal(200);
                done();
            };
            
            kpmApi(options)(req, res, next);
        });
        
        it('should pass error if result not recognized', function(done) {
            options.fetch = function(id, version, callback) {
                callback([]);
            };
            
            kpmApi(options)(req, res, function(msg) {
                expect(msg).not.be.null;
                done();
            });
        });
        
        it('should respond 404 if package doesnt exist', function(done) {
            req.method = 'HEAD';
            options.exists = function(id, version, callback) {
                callback(false);
            };
            
            res.send = function(status) {
                expect(status).to.equal(404);
                done();
            };
            
            kpmApi(options)(req, res, next);
        });
        
        it('should respond 200 if package exists', function(done) {
            req.method = 'HEAD';
            options.exists = function(id, version, callback) {
                callback(true);
            };
            
            res.send = function(status) {
                expect(status).to.equal(200);
                done();
            };
            
            kpmApi(options)(req, res, next);
        });
    });
});