var chai = require('chai'),
    expect = chai.expect,
    kpm = require('../../index'),
    publishApi = kpm.publishing;

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
            unpublish: function () { }
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
    });
});