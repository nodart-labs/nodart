import {Http2ServerRequest, Http2ServerResponse} from "http2";
import {App} from '../core/app'
import {HttpHandler} from "../core/http_handler";
import {StaticLoader} from "../loaders/static_loader";
import {HttpClient} from "../core/http_client";

export = async (app: App, request: Http2ServerRequest, response: Http2ServerResponse) => {

    const staticLoader = <StaticLoader>app.get('static')

    const http = new HttpClient(request, response)

    const urlPath = http.parseURL.pathname === '/' ? app.config.get.staticIndex : http.parseURL.pathname

    const file = staticLoader.require(urlPath).call()

    if (file) return staticLoader.send(file, response)

    const handler = new HttpHandler(app, http)

    if (app.httpHandler) return await app.httpHandler(handler)

    await handler.runController()
}
