"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = void 0;
class Engine {
    constructor(_config) {
        this._config = _config;
        this.client = require('nunjucks'); // See template engine docs: https://mozilla.github.io/nunjucks/api.html
        this.client.configure(_config.views, _config.options);
    }
    view(template, args) {
        return this.client.render(this.normalize(template), args);
    }
    normalize(template) {
        template.match(/^(.*?)\.([^.]+)$/i) || (template += '.html');
        return template;
    }
}
exports.Engine = Engine;
//# sourceMappingURL=engine.js.map