var chai = require('chai'),
    expect = chai.expect,
    kpmApi = require('../../index');

describe('API Key Verification:', function () {
    var handler = null;

    var wrapper = function () {
        kpmApi.verifyKey(handler);
    };

    describe('Setter Method', function () {

        it('should require a function parameter', function () {
            handler = 'foo';
            expect(wrapper).to.throw();

            handler = 'foo';
            expect(wrapper).to.throw();

            handler = 'foo';
            expect(wrapper).to.throw();

            handler = function() {};
            expect(wrapper).to.not.throw();
        });
    });
});