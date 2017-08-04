'use strict';

const Joi = require('joi');

module.exports = {
    jwt: Joi.object({
        publicKey: Joi.string().required()
    }),
    plan3Key: Joi.object({
        tokens: Joi.object().pattern(/\w+/, Joi.string()).required()
    }),
    bearer: Joi.object({
        tokens: Joi.object().pattern(/\w+/, Joi.string()).required()
    })
};
