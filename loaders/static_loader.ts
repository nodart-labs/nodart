import {AppLoader} from "../core/app_loader";
import {App} from "../core/app";
import {DEFAULT_STATIC_REPOSITORY, DEFAULT_MIME_TYPES, DEFAULT_MIME_TYPE} from "../core/app_config";
import {Http2ServerResponse} from "http2";
import {$} from '../utils'

const fs = require('fs')
const path = require('path')

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

        const ext = $.trim(path.extname(filePath), '.')

        const mimeTypes = Object.assign({...DEFAULT_MIME_TYPES}, this._app.config.get.mimeTypes ?? {})

        const contentType = mimeTypes[ext] || this._app.config.get.mimeType || DEFAULT_MIME_TYPE

        fs.readFile(filePath, (err, content) => {
            // todo: exception handler
            if (err) {
                response.writeHead(500)
                response.end()
            } else {
                response.writeHead(200, { 'Content-Type': contentType })
                response.end(content, 'utf-8')
            }
        })
    }

}
