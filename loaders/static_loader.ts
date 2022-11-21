import {AppLoader} from "../core/app_loader";
import {App} from "../core/app";
import {DEFAULT_STATIC_INDEX, DEFAULT_STATIC_REPOSITORY} from "../core/app_config";
import {HTTP_STATUS, HttpMimeTypes} from "../core/interfaces/http";
import {fs, $} from "../utils";
import {Http2ServerRequest, Http2ServerResponse} from "http2";
import {HttpException} from "../core/exception";
import {FILE_CONTENT_TYPE, HttpClient} from "../core/http_client";
import {AppConfigInterface} from "../core/interfaces/app";

export class StaticLoader extends AppLoader {

    static cache: object = {}

    protected _repository = DEFAULT_STATIC_REPOSITORY

    constructor(readonly app: App) {

        super(app)

        this.repository = app.config.get.static.dirname || DEFAULT_STATIC_REPOSITORY
    }

    call(args: [config: AppConfigInterface], path: string): string {

        path !== '/' && path.includes('%') && (path = decodeURIComponent(path))

        const config = args[0]

        StaticLoader.cache[config.rootDir] ||= {}

        if (StaticLoader.cache[config.rootDir][path] !== undefined) return StaticLoader.cache[config.rootDir][path]

        if (path === '/') {
            const repo = config.static?.dirname || DEFAULT_STATIC_REPOSITORY
            const index = config.static?.index || DEFAULT_STATIC_INDEX
            const indexPath = fs.join(config.rootDir, fs.join(repo, index))
            return StaticLoader.cache[config.rootDir][path] = fs.isFile(indexPath) ? indexPath : ''
        }

        return this.absPath($.trimPath(path), config.rootDir)
    }

    serve(path: string, scope: {
        app?: App,
        mimeTypes?: HttpMimeTypes,
        request: Http2ServerRequest,
        response: Http2ServerResponse,
        callback: (result: string | boolean | undefined) => any
    }) {

        scope.app ||= this.app
        scope.mimeTypes ||= HttpClient.mimeTypes(scope.app.config.get.http?.mimeTypes)

        const extension = fs.getExtension(path)
        const readStream = fs.system.createReadStream(path)
        const file = {error: null, exists: true}

        StaticLoader.cache[scope.app.rootDir] ||= {}

        readStream.on('error', async (err) => {

            file.exists = err.code !== 'ENOENT' && err.code !== 'EISDIR'
            file.error = err

            if (file.exists) return scope.app.resolveException(
                new HttpException({
                    exceptionMessage:
                        `Could not read data from file "${path.replace(this.getRepo(scope.app.rootDir), '')}".`,
                    exceptionData: err
                }),
                scope.request,
                scope.response
            )

            StaticLoader.cache[scope.app.rootDir][scope.request.url] = path.endsWith('favicon.ico') ? false : ''
        })

        readStream.on('close', () => {
            file.error || HttpClient.getResponseIsSent(scope.response) || scope.response.writeHead(HTTP_STATUS.OK, {
                'Content-Type': HttpClient.getDefaultContentType(extension, scope.mimeTypes, FILE_CONTENT_TYPE)
            })
            scope.callback(file.exists || StaticLoader.cache[scope.app.rootDir][scope.request.url])
        })

        readStream.pipe(scope.response)
    }

    onGenerate(repository: string): void {
    }

}
