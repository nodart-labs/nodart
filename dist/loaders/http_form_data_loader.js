"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpFormDataLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const http_client_1 = require("../core/http_client");
class HttpFormDataLoader extends app_loader_1.AppLoader {
    call(args) {
        var _a;
        const config = ((args === null || args === void 0 ? void 0 : args[1]) || ((_a = this.app.config.get.http) === null || _a === void 0 ? void 0 : _a.form) || {});
        return new http_client_1.HttpFormData(args[0], config);
    }
    onCall() {
    }
    onGenerate(repository) {
    }
}
exports.HttpFormDataLoader = HttpFormDataLoader;
//# sourceMappingURL=http_form_data_loader.js.map