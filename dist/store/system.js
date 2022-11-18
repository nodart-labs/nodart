"use strict";
module.exports = Object.freeze({
    states: {
        app: null,
        loaders: {
            static: null,
            http: null,
            controller: null,
            service: null,
            model: null,
        }
    },
    events: Object.freeze({
        HTTP_REQUEST: require('../events/http_request'),
        HTTP_RESPONSE: require('../events/http_response'),
    })
});
//# sourceMappingURL=system.js.map