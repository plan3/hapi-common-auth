# Hapi Common Auth Plugin [![Build Status](https://travis-ci.org/plan3/cls-named-logger.svg?branch=master)](https://travis-ci.org/plan3/hapi-common-auth)

## Installtion

`npm install hapi-common-auth`

## Usage

```javascript
const Hapi = require('hapi');
const server = new Hapi.Server();
const commonAuth = require('@plan3-relate/hapi-common-auth');


// register the plugin
server.register({
    register: commonAuth,
    options: {
        jwt: {
            publicKey: '...'
        },
        bearer: {
            tokens: {...}
        },
        plan3Key: {
            tokens: {...}
        }
    }
});
```

### Adding additional credentials

Bearer and Plan3Key strategy resolves newsroom as part credentials by default. One could change this behaviour
by defining `addtionalCredentials` object in the plugin options. Those will be merged into credentials object
returned by plugin.

Example:

```javascript
// register the plugin
server.register({
    register: commonAuth,
    options: {
        bearer: {
            tokens: {
                exampleToken: 'some newsroom'
            },
            additionalCredentials: {
                role: 'admin',
                origin: 'bearer'
            }
        }
    }
});
```

That will result in `request.auth.credentials` Object to equal:

```json
{
    "newsroom": "some newsroom",
    "role": "admin",
    "origin": "bearer"
}
```
