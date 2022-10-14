import {AppLoader} from "../core/app_loader";
import {HttpFormData} from "../core/http_client";
import {BaseHttpResponseHandlerInterface, HttpFormDataConfigExtended} from "../interfaces/http";

export class HttpFormDataLoader extends AppLoader {

    protected _config: HttpFormDataConfigExtended

    protected _http: BaseHttpResponseHandlerInterface

    protected get targetType() {

        return HttpFormData
    }

    protected _onCall(target?: any, args?: [
        http: BaseHttpResponseHandlerInterface,
        config: HttpFormDataConfigExtended
    ]) {
        this._http = args?.[0]
        this._config = (args?.[1] ?? this._app.config.get.formData ?? {}) as HttpFormDataConfigExtended
    }

    protected _resolve(): any {

        return new HttpFormData(this._http, this._config)
    }

    protected _onGenerate(repository: string) {
    }

}
