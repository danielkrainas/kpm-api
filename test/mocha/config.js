var chai = require('chai'),
    expect = chai.expect,
    kpm = require('../../index'),
    config = kpm.config;

describe('Config:', function () {
    var options, req, res, basePath = '/kpm-config.json';

    var apiWrapper = function(o) {
        return function() {
            publishApi(o);
        };
    };

    beforeEach(function () {
        options = {};
    });

    describe('Basics', function () {
        beforeEach(function () {
            req = {
                path: basePath,
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
            var ware = config(options);
            expect(ware).to.exist;
            expect(ware).to.be.a('function');
            expect(ware.length).to.equal(3);
        });

        it('should passthrough if unrecognized path', function (done) {
            req.path = '/foo/';
            config(options)(req, res, function () {
                done();
            });
        });
    });
});