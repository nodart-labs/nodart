import {App} from "../core/app";
import {AppLoader} from "../core/app_loader";
import {HttpClient} from "../core/http_client";
import {Http2ServerRequest, Http2ServerResponse} from "http2";
import {
    HttpResponseData,
    HttpClientConfigInterface,
    BaseHttpResponseHandlerInterface
} from "../interfaces/http";
import {RuntimeException} from "../core/exception";

export class HttpClientLoader extends AppLoader {

    protected _request: Http2ServerRequest

    protected _response: Http2ServerResponse

    protected _target: BaseHttpResponseHandlerInterface

    protected _config: HttpClientConfigInterface

    protected get targetType() {

        return HttpClient
    }

    protected _onCall(target: BaseHttpResponseHandlerInterface, args?: [
        request: Http2ServerRequest,
        response: Http2ServerResponse,
        config: HttpClientConfigInterface
    ]) {
        this._request = args?.[0]
        this._response = args?.[1]
        this._config = args?.[2] ?? {} as HttpClientConfigInterface
    }

    protected _resolve(): any {

        const client = new HttpClient(this._request, this._response, this._config)

        const app = this._app

        client.host = this._app.host

        Object.assign(client, {
            get form() {
                return this._form ||= app.get('http_form').call([client])
            }
        })

        client.setResponseData = async function (data: HttpResponseData) {
            await App.system.listen({
                event: {
                    [App.system.events.HTTP_RESPONSE]: [app, client.getHttpResponse(this.responseData = data)]
                }
            })
        }

        client.onError = async function () {
            await app.resolveExceptionOnHttp(new RuntimeException(this), this.request, this.response)
        }

        return client
    }

    protected _onGenerate(repository: string) {
    }

}
