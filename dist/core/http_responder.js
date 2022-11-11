"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpResponder = void 0;
class HttpResponder {
    constructor(http, engine) {
        this.http = http;
        this.engine = engine;
    }
    data(body, status, contentType) {
        this.http.send(body, status, contentType);
    }
    view(template, assign, status, callback) {
        this.http.sendHtml(this.engine.getTemplate(template, assign, callback), status);
    }
}
exports.HttpResponder = HttpResponder;
//# sourceMappingURL=http_responder.js.map