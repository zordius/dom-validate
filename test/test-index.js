var assert = require('chai').assert;
var DV = require('..');

describe('dom-validate module', function () {
    describe('.validateHTML()', function () {
        it('should return 1 when error', function () {
            assert.equal(DV.validateHTML('<body><div></div></body>', {require: 'span'}), 1);
        });

        it('should handle options.require[]', function () {
            assert.equal(DV.validateHTML('<body><div></div></body>', {require: ['span', 'i']}), 2);
        });

        it('should handle options.refuse', function () {
            assert.equal(DV.validateHTML('<body><div></div></body>', {refuse: 'div'}), 1);
        });

        it('should handle options.refuse[]', function () {
            assert.equal(DV.validateHTML('<body><div></div><i></i></body>', {refuse: ['div', 'i']}), 2);
        });
    });
});
