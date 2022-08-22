import {AppLoader} from "../core/app_loader";
import {App} from "../core/app";
import {DEFAULT_STATIC_REPOSITORY} from "../core/app_config";
import {Http2ServerResponse} from "http2";
import {Resource} from "../core/resource";

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

        this.isFile(path) && (this._target = this.absPath(path))

        return this
    }

    protected _resolve(target?: any, args?: any[]): any {

        return target
    }

    send(filePath: string, response: Http2ServerResponse) {

        const conf = this._app.config.get

        return new Resource(response).sendFile(filePath, conf.mimeTypes, conf.mimeType)
    }

}
