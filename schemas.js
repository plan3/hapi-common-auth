'use strict';

const Joi = require('joi');

module.exports = {
    jwt: Joi.object({
        publicKey: Joi.string().required(),
        nonExpiringIds: Joi.array().items(Joi.string()).unique()
    }),
    plan3Key: Joi.object({
        tokens: Joi.object().pattern(/\w+/, Joi.string()).required(),
        additionalCredentials: Joi.object()
    }),
    bearer: Joi.object({
        tokens: Joi.object().pattern(/\w+/, Joi.string()).required(),
        additionalCredentials: Joi.object()
    })
};
