var chai = require('chai'),
    expect = chai.expect,
    ownerApi = require('../../index').owner;

describe('Owner API:', function () {
    var options, req, res;

    var apiWrapper = function(options) {
        return function() {
            ownerApi(options);
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
                },
                query: {}
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

    describe('List Handler:', function() {
        beforeEach(function() {
            req = {
                path: '/o/',
                method: 'GET',
                get: function() {
                    return null;
                },
                query: {}
            };
            
            res = {
                send: function() {}
            };
        });

        it('should return empty list when result is null', function(done) {
            done();
        });
    });
});