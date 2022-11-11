"use strict";
module.exports = Object.freeze({
    states: {
        app: null,
        loaders: {
            static: null,
            http: null,
            httpService: null,
            controller: null,
            service: null,
            model: null,
        }
    },
    events: {
        HTTP_REQUEST: 'HTTP_REQUEST',
        HTTP_RESPONSE: 'HTTP_RESPONSE',
    }
});
//# sourceMappingURL=system.js.map