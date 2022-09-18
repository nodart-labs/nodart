"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceptionTemplateLoader = void 0;
const app_loader_1 = require("../core/app_loader");
class ExceptionTemplateLoader extends app_loader_1.AppLoader {
    getTemplate(response) {
        const template = this._app.config.get.exception.template;
        return template instanceof Function ? template(response) : template;
    }
    _onCall(target, args) {
    }
    _resolve(target, args) {
        var _a;
        const template = this.getTemplate(args[0]);
        const engineLoader = this._app.get('engine');
        const engine = engineLoader.call();
        if (!template || !(engineLoader === null || engineLoader === void 0 ? void 0 : engineLoader.isFile(engine === null || engine === void 0 ? void 0 : engine.normalize(template))))
            return;
        return engine.view(template, { response: (_a = args[0]) !== null && _a !== void 0 ? _a : {} });
    }
    _onGenerate(repository) {
    }
}
exports.ExceptionTemplateLoader = ExceptionTemplateLoader;
//# sourceMappingURL=exception_template_loader.js.map