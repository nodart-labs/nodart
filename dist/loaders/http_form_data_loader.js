"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpFormDataLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const http_client_1 = require("../core/http_client");
class HttpFormDataLoader extends app_loader_1.AppLoader {
    get targetType() {
        return http_client_1.HttpFormData;
    }
    _onCall(target, args) {
        var _a, _b;
        this._http = args === null || args === void 0 ? void 0 : args[0];
        this._config = ((_b = (_a = args === null || args === void 0 ? void 0 : args[1]) !== null && _a !== void 0 ? _a : this._app.config.get.formData) !== null && _b !== void 0 ? _b : {});
    }
    _resolve() {
        return new http_client_1.HttpFormData(this._http, this._config);
    }
    _onGenerate(repository) {
    }
}
exports.HttpFormDataLoader = HttpFormDataLoader;
//# sourceMappingURL=http_form_data_loader.js.map