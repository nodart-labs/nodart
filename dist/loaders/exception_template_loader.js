"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceptionTemplateLoader = void 0;
const app_loader_1 = require("../core/app_loader");
class ExceptionTemplateLoader extends app_loader_1.AppLoader {
    getTemplate(response) {
        var _a;
        const template = (_a = this.app.config.get.exception) === null || _a === void 0 ? void 0 : _a.template;
        return template instanceof Function ? template(response) : template;
    }
    call(args) {
        const template = this.getTemplate(args[0]);
        const engineLoader = this.app.get('engine');
        const engine = engineLoader.call();
        if (!template || !engineLoader.isFile(engine.normalize(template)))
            return;
        return engine.getTemplate(template, { response: args[0] });
    }
    onCall() {
    }
    onGenerate(repository) {
    }
}
exports.ExceptionTemplateLoader = ExceptionTemplateLoader;
//# sourceMappingURL=exception_template_loader.js.map