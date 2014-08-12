var sinon = require('sinon'),
       chai = require('chai'),
       Readable = require('stream').Readable,
       util = require('util'),
       expect = chai.expect,
       kpmApi = require('../../index'),
       ownerApi = kpmApi.owner;

describe('Owner API:', function () {
    var options, req, res;

    beforeEach(function() {
        options = {
            add: function() {},
            remove: function() {},
            list: function() {}
        };
    });

    describe('Basics', function () {
        beforeEach(function () {
            req = {
                path: '/',
                method: 'GET',
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
});