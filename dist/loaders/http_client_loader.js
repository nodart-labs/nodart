"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClientLoader = void 0;
const app_1 = require("../core/app");
const app_loader_1 = require("../core/app_loader");
const http_client_1 = require("../core/http_client");
class HttpClientLoader extends app_loader_1.AppLoader {
    get targetType() {
        return http_client_1.HttpClient;
    }
    _onCall(target, args) {
        this._request = args === null || args === void 0 ? void 0 : args[0];
        this._response = args === null || args === void 0 ? void 0 : args[1];
        this._config = args === null || args === void 0 ? void 0 : args[2];
    }
    _resolve(target, args) {
        const client = new http_client_1.HttpClient(this._request, this._response, this._config);
        const app = this._app;
        client.host = this._app.host;
        client.setResponseData = function (data) {
            return __awaiter(this, void 0, void 0, function* () {
                yield app_1.App.system.listen({
                    event: {
                        [app_1.App.system.events.HTTP_RESPONSE]: [app, client.getHttpResponse(this.responseData = data)]
                    }
                });
            });
        };
        return this._target = client;
    }
    _onGenerate(repository) {
    }
}
exports.HttpClientLoader = HttpClientLoader;
//# sourceMappingURL=http_client_loader.js.map