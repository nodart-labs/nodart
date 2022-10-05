"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpRespondLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const http_respond_1 = require("../core/http_respond");
const http_client_1 = require("../core/http_client");
const exception_1 = require("../core/exception");
class HttpRespondLoader extends app_loader_1.AppLoader {
    _onCall(target) {
    }
    _resolve(target, args) {
        const http = args === null || args === void 0 ? void 0 : args[0];
        if (!(http instanceof http_client_1.HttpClient))
            throw new exception_1.RuntimeException('HttpRespondLoader: HttpClient for HttpRespond was not supplied.');
        const Respond = this.getRespondClass(http);
        return new Respond();
    }
    getRespondClass(http) {
        const app = this._app;
        class BaseHttpRespond extends http_respond_1.HttpRespond {
            constructor() {
                super(http);
            }
            get engine() {
                return this._engine || (this._engine = app.get('engine').call());
            }
        }
        return BaseHttpRespond;
    }
    _onGenerate(repository) {
    }
}
exports.HttpRespondLoader = HttpRespondLoader;
//# sourceMappingURL=http_respond_loader.js.map