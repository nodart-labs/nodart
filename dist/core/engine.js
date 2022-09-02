"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = void 0;
class Engine {
    constructor(config) {
        this.config = config;
        this.client = require('nunjucks');
        this.client.configure(config.views, config.options);
    }
    view(template, args, callback) {
        return this.client.render(this.normalize(template), args, callback);
    }
    normalize(template) {
        template.match(/^(.*?)\.([^.]+)$/i) || (template += '.html');
        return template;
    }
}
exports.Engine = Engine;
//# sourceMappingURL=engine.js.map