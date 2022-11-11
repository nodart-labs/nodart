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
const exception_1 = require("../core/exception");
class HttpClientLoader extends app_loader_1.AppLoader {
    call(args) {
        const app = args[0];
        const config = Object.assign(Object.assign({}, app.config.get.http), args[1] || {});
        const session = config.session || { client: null, config: { secret: '' } };
        const engine = config.engine || { client: null, config: { options: {} } };
        const container = new http_client_1.HttpContainer(config);
        container.assignData({
            onSetResponseData: config.onSetResponseData || (function (data) {
                return __awaiter(this, void 0, void 0, function* () {
                    yield app_1.App.system.listen({
                        event: {
                            [app_1.App.system.events.HTTP_RESPONSE]: [app, container.getHttpResponse(data)]
                        }
                    });
                });
            }),
            onError: config.onError || (function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield app.resolveException(new exception_1.RuntimeException(container), this.request, this.response);
                });
            }),
            session: {
                config: session.config,
                client: session.client || (function () {
                    return app.get('session').call([container, session.config]);
                })
            },
            engine: {
                config: engine.config,
                client: engine.client || (function () {
                    return app.get('engine').call([engine.config]);
                })
            }
        });
        return container;
    }
    onCall() {
    }
    onGenerate(repository) {
    }
}
exports.HttpClientLoader = HttpClientLoader;
//# sourceMappingURL=http_client_loader.js.map