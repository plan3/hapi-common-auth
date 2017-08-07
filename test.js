'use strict';

const should = require('chai').should();
const hapi = require('hapi');
const plugin = require('./index');

describe('Hapi common auth tests', function() {
    [{
        options: {jwt: ''},
        expect: (err) => should.exist(err, 'Error should be present')
    }, {
        options: {jwt: {}},
        expect: (err) => should.exist(err, 'Error should be present')
    }, {
        options: {jwt: {
            publicKey: []
        }},
        expect: (err) => should.exist(err, 'Error should be present')
    }, {
        options: {jwt: {
            publicKey: {}
        }},
        expect: (err) => should.exist(err, 'Error should be present')
    }, {
        options: {jwt: {
            publicKey: undefined
        }},
        expect: (err) => should.exist(err, 'Error should be present')
    }, {
        options: {jwt: {
            publicKey: 'some key'
        }},
        expect: (err) => should.not.exist(err, 'Error should not be present')
    }, {
        options: {bearer: ''},
        expect: (err) => should.exist(err, 'Error should be present')
    }, {
        options: {bearer: {}},
        expect: (err) => should.exist(err, 'Error should be present')
    }, {
        options: {bearer: []},
        expect: (err) => should.exist(err, 'Error should be present')
    }, {
        options: {bearer: {
            tokens: 'user'
        }},
        expect: (err) => should.exist(err, 'Error should be present')
    }, {
        options: {bearer: {
            tokens: []
        }},
        expect: (err) => should.exist(err, 'Error should be present')
    }, {
        options: {bearer: {
            tokens: {}
        }},
        expect: (err) => should.not.exist(err, 'Error should not be present')
    }, {
        options: {bearer: {
            tokens: {
                user: 'token'
            }
        }},
        expect: (err) => should.not.exist(err, 'Error should not be present')
    }, {
        options: {plan3Key: ''},
        expect: (err) => should.exist(err, 'Error should be present')
    }, {
        options: {plan3Key: {}},
        expect: (err) => should.exist(err, 'Error should be present')
    }, {
        options: {plan3Key: []},
        expect: (err) => should.exist(err, 'Error should be present')
    }, {
        options: {plan3Key: {
            tokens: 'user'
        }},
        expect: (err) => should.exist(err, 'Error should be present')
    }, {
        options: {plan3Key: {
            tokens: []
        }},
        expect: (err) => should.exist(err, 'Error should be present')
    }, {
        options: {plan3Key: {
            tokens: {}
        }},
        expect: (err) => should.not.exist(err, 'Error should not be present')
    }, {
        options: {plan3Key: {
            tokens: {
                user: 'token'
            }
        }},
        expect: (err) => should.not.exist(err, 'Error should not be present')
    }].forEach((dataSet, i) => {
        it(`Required valid input as a configuration object #${i}`, function() {
            const server = new hapi.Server();
            server.connection({port: 1234});
            return server.register({register: plugin, options: dataSet.options})
                .then(dataSet.expect, dataSet.expect);
        });
    });
});
