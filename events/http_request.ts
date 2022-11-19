import {Http2ServerRequest, Http2ServerResponse} from "http2";
import {App} from "../core/app";
import {HttpClient} from "../core/http_client";
import {HTTP_CONTENT_MIME_TYPES, HTTP_STATUS} from "../core/interfaces/http";
import {AppEventHttpRequestInterface} from "../core/interfaces/app";
import {HttpHandler} from "../core/http_handler";
import {HttpException} from "../core/exception";

export = <AppEventHttpRequestInterface>((app: App, request: Http2ServerRequest, response: Http2ServerResponse) => {

    if (HttpClient.getResponseIsSent(response)) return

    const handler = new HttpHandler(app, request, response)

    handler.setCors()

    try {

        handler.serveStatic((result) => {

            if (result) return

            if (result === false) {
                response.writeHead(HTTP_STATUS.NO_CONTENT, {'Content-Type': HTTP_CONTENT_MIME_TYPES.icon})
                response.end()
                return
            }

            handler.fetchRequestData(() => {

                const route = app.router.getRouteByURLPathname(handler.url, handler.http.method)

                if (false === handler.runHttpService(route) && false === handler.initController(route))

                    throw new HttpException(handler.http, {status: HTTP_STATUS.NOT_FOUND})

            })
        })

    } catch (err) {

        app.resolveException(err, request, response)
    }
})
