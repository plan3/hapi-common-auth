# Hapi Common Auth Plugin [![Build Status](https://travis-ci.org/plan3/cls-named-logger.svg?branch=master)](https://travis-ci.org/plan3/hapi-common-auth)

## Installtion

`npm install hapi-common-auth`

## Usage

```javascript
const Hapi = require('hapi');
const server = new Hapi.Server();
const commonAuth = require('hapi-common-auth');


// register the plugin
server.register({
    register: commonAuth,
    options: {
        jwt: {
            publicKey: '...'
        },
        bearer: {
            tokens: {...}
        }
    }
});
```
