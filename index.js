'use strict';

const jwtAuth = require('hapi-auth-jwt2');
const bearerAuth = require('hapi-auth-bearer-token');

/**
 * @typedef {Object} JwtOptions
 * @property {string} publicKey
 */
/**
 * @typedef {Object} BearerOptions
 * @property {Object.<string, string>} tokens
 */
/**
 * @typedef {Object} Plan3KeyOptions
 * @property {Object.<string, string>} tokens
 */
/**
 * @typedef {Object} AuthOptions
 * @property {Object} defaultAuth
 * @property {JwtOptions} jwt
 * @property {BearerOptions} bearer
 * @property {Plan3KeyOptions} plan3Key
 */

/**
 * @param {string} base64
 * @return {string}
 */
const base64toPem = function(base64) {
    let result = '';
    for (let lines = 0; result.length - lines < base64.length; lines++) {
        result += base64.substr(result.length - lines, 64) + '\n';
    }

    return '-----BEGIN PUBLIC KEY-----\n' + result + '-----END PUBLIC KEY-----';
};

/**
 * @param {Object} server
 * @return {Promise}
 */
let bearerRegistered = false;
const registerBearer = function(server) {
    if (bearerRegistered) {
        return Promise.resolve();
    }
    bearerRegistered = true;
    return server.register(bearerAuth);
};

/**
 * @param {Object} server
 * @param {JwtOptions} options
 * @return {Promise}
 */
const registerJwtStrategy = function(server, options) {
    return server.register(jwtAuth)
        .then(() => {
            server.auth.strategy('jwt', 'jwt', {
                key: base64toPem(options.publicKey),
                validateFunc: (decoded, request, callback) => {
                    callback(null, true);
                },
                verifyOptions: {algorithms: ['RS256', 'RS384', 'RS512']},
                tokenType: 'Plan3JWT'
            });
            return null;
        });
};

/**
 * @param {Object} server
 * @param {BearerOptions} options
 * @return {Promise}
 */
const registerBearerStrategy = function(server, options) {
    return registerBearer(server)
        .then(() => {
            server.auth.strategy('bearer', 'bearer-access-token', {
                validateFunc: (token, callback) => {
                    if (options.tokens.hasOwnProperty(token)) {
                        return callback(null, true, {
                            newsroom: options.tokens[token]
                        });
                    }
                    return callback(null, false);
                }
            });
            return null;
        });
};

/**
 * @param {Object} server
 * @param {Plan3KeyOptions} options
 * @return {Promise}
 */
const registerPlan3KeyStrategy = function(server, options) {
    return registerBearer(server)
        .then(() => {
            server.auth.strategy('plan3Key', 'bearer-access-token', {
                tokenType: 'Plan3Key',
                validateFunc: (token, callback) => {
                    if (options.tokens.hasOwnProperty(token)) {
                        return callback(null, true, {
                            newsroom: options.tokens[token]
                        });
                    }
                    return callback(null, false);
                }
            });
            return null;
        });
};

/**
 * @param {Object} server
 * @param {AuthOptions} options
 * @param {function} next
 */
module.exports.register = function(server, options, next) {
    const strategies = [];
    const defaultAuth = {
        strategies: []
    };

    if (options.jwt) {
        strategies.push(registerJwtStrategy(server, options.jwt));
        defaultAuth.strategies.push('jwt');
    }

    if (options.bearer) {
        strategies.push(registerBearerStrategy(server, options.bearer));
        defaultAuth.strategies.push('bearer');
    }

    if (options.plan3Key) {
        strategies.push(registerPlan3KeyStrategy(server, options.plan3Key));
        defaultAuth.strategies.push('plan3Key');
    }

    Promise.all(strategies)
        .then(() => {
            server.auth.default(Object.assign(defaultAuth, options.defaultAuth));
            return null;
        })
        .then(next)
        .catch(next);
};

module.exports.register.attributes = {
    pkg: require('./package.json')
};
