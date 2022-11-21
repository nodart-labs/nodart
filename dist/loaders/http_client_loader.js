"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClientLoader = void 0;
const app_loader_1 = require("../core/app_loader");
const http_client_1 = require("../core/http_client");
const exception_1 = require("../core/exception");
const app_config_1 = require("../core/app_config");
class HttpClientLoader extends app_loader_1.AppLoader {
    call(args) {
        const app = args[0];
        const config = Object.assign(Object.assign({}, app.config.get.http), args[1] || {});
        const session = config.session || { client: null, config: { secret: '' } };
        const engine = config.engine || { client: null, config: { options: {} } };
        const container = new http_client_1.HttpContainer(config);
        container.assignData({
            onSetResponseData: config.onSetResponseData || (function (data) {
                app_config_1.SYSTEM_STORE.events.HTTP_RESPONSE(app, container.getHttpResponse(data));
            }),
            onError: config.onError || (function () {
                app.resolveException(new exception_1.RuntimeException(container), container.request, container.response);
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
    onGenerate(repository) {
    }
}
exports.HttpClientLoader = HttpClientLoader;
//# sourceMappingURL=http_client_loader.js.map