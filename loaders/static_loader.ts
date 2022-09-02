import {AppLoader} from "../core/app_loader";
import {App} from "../core/app";
import {DEFAULT_STATIC_REPOSITORY} from "../core/app_config";
import {HttpClient} from "../core/http_client";

export class StaticLoader extends AppLoader {

    protected _repository = DEFAULT_STATIC_REPOSITORY

    constructor(protected _app: App) {
        super(_app)
        this._repository = _app.config.get.static ?? DEFAULT_STATIC_REPOSITORY
    }

    protected _onCall(target: any, args?: any[]): void {
    }

    protected _onGenerate(repository: string): void {
    }

    require(path: string) {

        path = decodeURIComponent(path)

        this.isFile(path) && (this._target = this.absPath(path))

        return this
    }

    protected _resolve(target?: any, args?: any[]): any {

        return target
    }

    send(filePath: string, http: HttpClient) {

        const conf = this._app.config.get

        return http.sendFile(filePath, conf.mimeTypes, conf.mimeType)
    }

}
