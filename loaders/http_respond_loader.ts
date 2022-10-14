import {AppLoader} from "../core/app_loader";
import {HttpRespond, HttpResponder} from "../core/http_respond";
import {Engine} from "../core/engine";
import {HttpClient} from "../core/http_client";
import {RuntimeException} from "../core/exception";

export class HttpRespondLoader extends AppLoader {

    protected _onCall(target: any) {
    }

    protected _resolve(target?: any, args?: [http: HttpClient]): any {

        const http = args?.[0]

        if (!(http instanceof HttpClient))

            throw new RuntimeException('HttpRespondLoader: HttpClient for HttpRespond was not supplied.')

        const Respond = this.getRespondClass(http)

        return new Respond()
    }

    getRespondClass(http: HttpClient) {

        const app = this._app

        class BaseHttpRespond extends HttpRespond {

            protected _engine: Engine

            protected _httpResponder: HttpResponder

            constructor() {
                super(http)
            }

            get engine() {
                return this._engine ||= <Engine>app.get('engine').call()
            }

            get httpResponder() {
                return this._httpResponder ||= new (app.config.get.httpResponder || HttpResponder)(this)
            }
        }

        return BaseHttpRespond
    }

    protected _onGenerate(repository: string) {
    }

}
