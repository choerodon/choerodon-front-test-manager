const chai = require('chai');
const assert = chai.assert;

describe('Chai Test', function () {
    it ('function test', function() {
        const userList = {};
        userList
        assert.notDeepInclude([obj1, obj2], {a: 9});
        assert.notDeepInclude({foo: obj1, bar: obj2}, {foo: {a: 9}});
        assert.notDeepInclude({foo: obj1, bar: obj2}, {foo: {a: 1}, bar: {b: 9}});

    });
});
