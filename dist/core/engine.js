"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = void 0;
class Engine {
    constructor(config) {
        this.config = config;
        this.client = require('nunjucks');
        this.client.configure(config.views, config.options);
    }
    getTemplate(templatePath, args, callback) {
        return this.client.render(this.normalize(templatePath), args, callback);
    }
    normalize(templatePath) {
        templatePath.match(/^(.*?)\.([^.]+)$/i) || (templatePath += '.html');
        return templatePath;
    }
}
exports.Engine = Engine;
//# sourceMappingURL=engine.js.map