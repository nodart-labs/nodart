import {Http2ServerRequest, Http2ServerResponse} from "http2";
import {App} from '../core/app'
import {HttpHandler} from "../core/http_handler";

export = async (app: App, request: Http2ServerRequest, response: Http2ServerResponse) => {

    const handler = new HttpHandler(app, request, response)

    if (app.httpHandler) return await app.httpHandler(handler)

    await handler.runController()
}
