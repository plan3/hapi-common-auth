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
        options: {
            jwt: {
                publicKey: []
            }
        },
        expect: (err) => should.exist(err, 'Error should be present')
    }, {
        options: {
            jwt: {
                publicKey: {}
            }
        },
        expect: (err) => should.exist(err, 'Error should be present')
    }, {
        options: {
            jwt: {
                publicKey: undefined
            }
        },
        expect: (err) => should.exist(err, 'Error should be present')
    }, {
        options: {
            jwt: {
                publicKey: 'some key'
            }
        },
        expect: (err) => should.not.exist(err, 'Error should not be present')
    }, {
        options: {
            jwt: {
                publicKey: 'some key',
                nonExpiringIds: 'some list of non expiring ids'
            }
        },
        expect: (err) => should.exist(err, 'Error should not be present')
    }, {
        options: {
            jwt: {
                publicKey: 'some key',
                nonExpiringIds: {
                    ids: 'some list of non expiring ids'
                }
            }
        },
        expect: (err) => should.exist(err, 'Error should not be present')
    }, {
        options: {
            jwt: {
                publicKey: 'some key',
                nonExpiringIds: ['some non expiring id']
            }
        },
        expect: (err) => should.not.exist(err, 'Error should not be present')
    }, {
        options: {
            jwt: {
                publicKey: 'some key',
                nonExpiringIds: ['some non expiring id', 'some non expiring id']
            }
        },
        expect: (err) => should.exist(err, 'Error should not be present')
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
        options: {
            bearer: {
                tokens: 'user'
            }
        },
        expect: (err) => should.exist(err, 'Error should be present')
    }, {
        options: {
            bearer: {
                tokens: []
            }
        },
        expect: (err) => should.exist(err, 'Error should be present')
    }, {
        options: {
            bearer: {
                tokens: {}
            }
        },
        expect: (err) => should.not.exist(err, 'Error should not be present')
    }, {
        options: {
            bearer: {
                tokens: {
                    user: 'token'
                }
            }
        },
        expect: (err) => should.not.exist(err, 'Error should not be present')
    }, {
        options: {
            bearer: {
                tokens: {
                    user: 'token'
                },
                additionalCredentials: {
                    whatever: {
                        iPut: 'what I want'
                    }
                }
            }
        },
        expect: (err) => should.not.exist(err, 'Error should not be present')
    }, {
        options: {
            bearer: {
                tokens: {
                    user: 'token'
                },
                additionalCredentials: []
            }
        },
        expect: (err) => should.exist(err, 'Error should be present')
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
        options: {
            plan3Key: {
                tokens: 'user'
            }
        },
        expect: (err) => should.exist(err, 'Error should be present')
    }, {
        options: {
            plan3Key: {
                tokens: []
            }
        },
        expect: (err) => should.exist(err, 'Error should be present')
    }, {
        options: {
            plan3Key: {
                tokens: {}
            }
        },
        expect: (err) => should.not.exist(err, 'Error should not be present')
    }, {
        options: {
            plan3Key: {
                tokens: {
                    user: 'token'
                }
            }
        },
        expect: (err) => should.not.exist(err, 'Error should not be present')
    }, {
        options: {
            plan3Key: {
                tokens: {
                    user: 'token'
                },
                additionalCredentials: {
                    whatever: {
                        iPut: 'what I want'
                    }
                }
            }
        },
        expect: (err) => should.not.exist(err, 'Error should not be present')
    }, {
        options: {
            plan3Key: {
                tokens: {
                    user: 'token'
                },
                additionalCredentials: []
            }
        },
        expect: (err) => should.exist(err, 'Error should be present')
    }].forEach((dataSet, i) => {
        it(`Required valid input as a configuration object #${i}`, function() {
            const server = new hapi.Server();
            server.connection({port: 1234});
            return server.register({register: plugin, options: dataSet.options})
                .then(dataSet.expect, dataSet.expect);
        });
    });

    [{
        credentials: undefined,
        expected: {newsroom: 'test newsroom'}
    }, {
        credentials: {},
        expected: {newsroom: 'test newsroom'}
    }, {
        credentials: {
            role: 'test role'
        },
        expected: {newsroom: 'test newsroom', role: 'test role'}
    }].forEach((dataSet, i) => {
        it(`allows to provide additional credentials with bearer strategy #${i}`, function() {
            const server = new hapi.Server();
            server.connection({port: 1234});
            return server.register({
                register: plugin, options: {
                    bearer: {
                        tokens: {
                            token: 'test newsroom'
                        },
                        // this will get passed as additional credentials
                        additionalCredentials: dataSet.credentials
                    }
                }
            }).then(() => {
                server.route({
                    method: 'GET',
                    path: '/',
                    handler: (request, reply) => reply(request.auth.credentials)
                });

                return server.inject({
                    method: 'GET',
                    url: '/',
                    headers: {
                        Authorization: 'Bearer token'
                    }
                });
            }).then(response => {
                response.statusCode.should.equal(200);
                const payload = JSON.parse(response.payload);
                return payload.should.deep.equal(dataSet.expected);
            });
        });
    });

    [{
        credentials: undefined,
        expected: {newsroom: 'test newsroom'}
    }, {
        credentials: {},
        expected: {newsroom: 'test newsroom'}
    }, {
        credentials: {
            role: 'test role'
        },
        expected: {newsroom: 'test newsroom', role: 'test role'}
    }].forEach((dataSet, i) => {
        it(`allows to provide additional credentials with plan3key strategy #${i}`, function() {
            const server = new hapi.Server();
            server.connection({port: 1234});
            return server.register({
                register: plugin, options: {
                    plan3Key: {
                        tokens: {
                            token: 'test newsroom'
                        },
                        // this will get passed as additional credentials
                        additionalCredentials: dataSet.credentials
                    }
                }
            }).then(() => {
                server.route({
                    method: 'GET',
                    path: '/',
                    handler: (request, reply) => reply(request.auth.credentials)
                });

                return server.inject({
                    method: 'GET',
                    url: '/',
                    headers: {
                        Authorization: 'Plan3Key token'
                    }
                });
            }).then(response => {
                response.statusCode.should.equal(200);
                const payload = JSON.parse(response.payload);
                return payload.should.deep.equal(dataSet.expected);
            });
        });
    });
});
