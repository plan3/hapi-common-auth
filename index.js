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
 * @typedef {Object} AuthOptions
 * @property {Object} defaultAuth
 * @property {JwtOptions} jwt
 * @property {BearerOptions} bearer
 */

/**
 * @param {string} base64
 * @return {string}
 */
const base64toPem = function(base64) {
    for (var result = '', lines = 0; result.length - lines < base64.length; lines++) {
        result += base64.substr(result.length - lines, 64) + '\n';
    }

    return '-----BEGIN PUBLIC KEY-----\n' + result + '-----END PUBLIC KEY-----';
};

/**
 * @param {Object} server
 * @param {JwtOptions} options
 * @return {Promise}
 */
const registerJwt = function(server, options) {
    return new Promise((resolve, reject) => {
        server.register(jwtAuth, function(error) {
            if (error) {
                return reject(error);
            }

            server.auth.strategy('jwt', 'jwt', {
                key: base64toPem(options.publicKey),
                validateFunc: (decoded, request, callback) => {
                    callback(null, true);
                },
                verifyOptions: {algorithms: ['RS256', 'RS384', 'RS512']},
                tokenType: 'Plan3JWT'
            });

            return resolve();
        });
    });
};

/**
 * @param {Object} server
 * @param {BearerOptions} options
 * @return {Promise}
 */
const registerBearer = function(server, options) {
    return new Promise((resolve, reject) => {
        server.register(bearerAuth, function(error) {
            if (error) {
                return reject(error);
            }

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

            return resolve();
        });
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
        strategies.push(registerJwt(server, options.jwt));
        defaultAuth.strategies.push('jwt');
    }

    if (options.bearer) {
        strategies.push(registerBearer(server, options.bearer));
        defaultAuth.strategies.push('bearer');
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
