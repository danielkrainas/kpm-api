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
        options = {
            packages: true,
            owner: true,
            publishing: true
        };

        req = {
            path: basePath,
            method: 'GET'
        };

        res = {
            send: function () { }
        };
    });

    describe('Basics', function () {
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

    describe('Options', function () {

        it('should use defaults when not supplied', function (done) {
            res.send = function(status, data) {
                expect(status).to.equal(200);
                expect(data.packages).to.exist;
                expect(data.publishing).to.exist;
                expect(data.owner).to.exist;
                done();
            };

            config({})(req, res, null);
        });
    });
});