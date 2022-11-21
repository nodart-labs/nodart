import {App} from "../core/app";
import {AppLoader} from "../core/app_loader";
import {HttpContainer} from "../core/http_client";
import {HttpResponseData, HttpContainerConfigInterface, HttpDataInterface} from "../core/interfaces/http";
import {RuntimeException} from "../core/exception";
import {SYSTEM_STORE} from "../core/app_config";

export class HttpClientLoader extends AppLoader {

    call(args: [app: App, config: Omit<HttpContainerConfigInterface & HttpDataInterface, 'method' | 'data' | 'form'>]): HttpContainer {

        const app = args[0]
        const config = {...app.config.get.http, ...args[1] || {}} as HttpContainerConfigInterface & HttpDataInterface
        const session = config.session || {client: null, config: {secret: ''}}
        const engine = config.engine || {client: null, config: {options: {}}}
        const container = new HttpContainer(config)

        container.assignData({
            onSetResponseData: config.onSetResponseData || (function (data: HttpResponseData) {
                SYSTEM_STORE.events.HTTP_RESPONSE(app, container.getHttpResponse(data))
            }),
            onError: config.onError || (function () {
                app.resolveException(new RuntimeException(container), container.request, container.response)
            }),
            session: {
                config: session.config,
                client: session.client || (function () {
                    return app.get('session').call([container, session.config])
                })
            },
            engine: {
                config: engine.config,
                client: engine.client || (function () {
                    return app.get('engine').call([engine.config])
                })
            }
        })

        return container
    }

    onGenerate(repository: string) {
    }

}
