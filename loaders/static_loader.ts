import {AppLoader} from "../core/app_loader";
import {App} from "../core/app";
import {DEFAULT_STATIC_FAVICON, DEFAULT_STATIC_INDEX, DEFAULT_STATIC_REPOSITORY} from "../core/app_config";
import {HTTP_CONTENT_MIME_TYPES, HTTP_STATUS, HttpMimeTypes} from "../core/interfaces/http";
import {fs, $} from "../utils";
import {Http2ServerRequest, Http2ServerResponse} from "http2";
import {HttpException} from "../core/exception";
import {FILE_CONTENT_TYPE, HttpClient} from "../core/http_client";
import {AppConfigInterface} from "../core/interfaces/app";

export class StaticLoader extends AppLoader {

    protected _repository = DEFAULT_STATIC_REPOSITORY

    constructor(readonly app: App) {

        super(app)

        this.repository = app.config.get.static.dirname || DEFAULT_STATIC_REPOSITORY
    }

    call(args: [app: App, config: AppConfigInterface, response: Http2ServerResponse], path: string): string | boolean {

        if (path !== '/') {
            if (!path.includes('.')) return ''
            path.includes('%') && (path = decodeURIComponent(path))
        }

        const app = args[0]
        const config = args[1] || {}
        const configStatic = config.static || {}
        const favicon = configStatic.favicon || DEFAULT_STATIC_FAVICON

        if (path === '/' + favicon) {
            const repo = configStatic.dirname || DEFAULT_STATIC_REPOSITORY
            const faviconPath = fs.join(config.rootDir, fs.join(repo, favicon))

            if (app.service.cashier.isFile(faviconPath)) return faviconPath

            const response = args[2]
            response.writeHead(HTTP_STATUS.NO_CONTENT, {'Content-Type': HTTP_CONTENT_MIME_TYPES.icon})
            response.end()
            return false
        }

        if (path === '/') {
            const repo = configStatic.dirname || DEFAULT_STATIC_REPOSITORY
            const index = configStatic.index || DEFAULT_STATIC_INDEX
            const indexPath = fs.join(config.rootDir, fs.join(repo, index))
            return app.service.cashier.isFile(indexPath) ? indexPath : ''
        }

        return this.absPath($.trimPath(path), config.rootDir)
    }

    send(path: string, scope: {
        app?: App,
        mimeTypes?: HttpMimeTypes,
        request: Http2ServerRequest,
        response: Http2ServerResponse
    }): Promise<boolean> {

        return new Promise((resolve) => {

            if (!path) {
                resolve(false)
                return
            }

            scope.app ||= this.app
            scope.mimeTypes ||= HttpClient.mimeTypes(scope.app.config.get.http?.mimeTypes)

            const extension = fs.getExtension(path)
            const readStream = fs.system.createReadStream(path)
            const file = {exists: undefined, error: null}

            readStream.on('error', async (err) => {
                file.exists = err.code !== 'ENOENT' && err.code !== 'EISDIR'
                file.error = err
                file.exists && await scope.app.resolveException(
                    new HttpException({
                        exceptionMessage:
                            `Could not read data from file "${path.replace(this.getRepo(scope.app.rootDir), '')}".`,
                        exceptionData: err
                    }),
                    scope.request,
                    scope.response
                )
            })

            readStream.on('close', () => {
                file.error || HttpClient.getResponseIsSent(scope.response) || scope.response.writeHead(HTTP_STATUS.OK, {
                    'Content-Type': HttpClient.getDefaultContentType(extension, scope.mimeTypes, FILE_CONTENT_TYPE)
                })
                resolve(file.exists ?? true)
            })

            readStream.pipe(scope.response)
        })
    }

    onCall(): void {
    }

    onGenerate(repository: string): void {
    }

}
