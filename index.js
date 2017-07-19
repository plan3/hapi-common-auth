'use strict';

const jwtAuth = require('hapi-auth-jwt2');
const bearerAuth = require('hapi-auth-bearer-token');

const DEFAULT_ROLE = 'internal';

const allowedStrategies = ['jwt', 'bearer'];

/**
 * @typedef {Object} JwtOptions
 * @property {string} publicKey
 */
/**
 * @typedef {Object} BearerOptions
 * @property {Object.<string, string>} tokens
 * @property {string} defaultRole
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
                            newsroom: options.tokens[token],
                            role: options.defaultRole || DEFAULT_ROLE
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
 * @return {Promise}
 */
exports.register = function(server, options = {}) {
    const defaultAuth = Object.assign({strategies: allowedStrategies}, options.defaultAuth);
    return Promise.all([
        registerJwt(server, options.jwt),
        registerBearer(server, options.bearer)
    ])
        .then(() => {
            server.auth.default(defaultAuth);
            return null;
        });
};

exports.register.attributes = {
    pkg: require('./package.json')
};
