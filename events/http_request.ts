import {Http2ServerRequest, Http2ServerResponse} from "http2";
import {App, loaders} from "../core/app";
import {JSON_CONTENT_TYPE, HttpClient} from "../core/http_client";
import {HTTP_CONTENT_MIME_TYPES, HTTP_METHODS, HTTP_STATUS} from "../core/interfaces/http";
import {HttpException} from "../core/exception";
import {CONTROLLER_INITIAL_ACTION} from "../core/controller";
import {AppEventHttpRequestInterface} from "../core/interfaces/app";
import {measure} from "../utils";

const warnings = {
    useCors: false,
    serveStatic: false,
    fetchDataOnRequest: false
}

export = <AppEventHttpRequestInterface>(async (app: App, request: Http2ServerRequest, response: Http2ServerResponse) => {

    if (HttpClient.getResponseIsSent(response)) return

    const config = app.config.get
    const configHttp = config.http || {}

    /**************************************
     CORS LOADER
     ***************************************/

    if (configHttp.useCors) {

        HttpClient.setCorsHeaders(response)

        if (request.method === 'OPTIONS') {
            response.writeHead(HTTP_STATUS.OK, {'Content-Type': JSON_CONTENT_TYPE})
            response.end()
            return
        }

    } else if (!warnings.useCors) {

        warnings.useCors = true

        console.log('The CORS headers are disabled in configuration.')
    }

    /**************************************
     SERVE STATIC
     ***************************************/

    if (config.static?.serve) {

        const pathname = request.url.includes('?') ? request.url.split('?')[0] : request.url
        const path = loaders().static.call([config], pathname)
        const sent = path && (await loaders().static.serve(path, {
            app,
            mimeTypes: HttpClient.mimeTypes(configHttp.mimeTypes),
            request,
            response
        }))

        if (false === sent) {
            response.writeHead(HTTP_STATUS.NO_CONTENT, {'Content-Type': HTTP_CONTENT_MIME_TYPES.icon})
            response.end()
            return
        }

        if (sent) return

    } else if (!warnings.serveStatic) {

        warnings.serveStatic = true

        console.log('Static files serve is disabled in configuration.')
    }

    /**************************************
     FETCHING REQUEST DATA
     ***************************************/

    const {url, query, queryString} = HttpClient.parseURL(request.url)

    const http = loaders().http.call([app, {host: app.host, uri: app.uri, query, queryString, request, response}])

    if (configHttp.fetchDataOnRequest) {

        ['POST', 'PUT', 'PATCH'].includes(request.method) && await http.fetchData()

    } else if (!warnings.fetchDataOnRequest) {

        warnings.fetchDataOnRequest = true

        console.log('Auto fetching data on request is disabled in configuration. Use "fetchData" method manually instead.')
    }

    /**************************************
     HTTP HANDLER
     ***************************************/

    const route = app.router.getRouteByURLPathname(url, http.method)

    if (route.callback) {

        const scope = app.factory.service.createServiceScope(http, route)

        const data = await route.callback(scope)

        if (HttpClient.getResponseIsSent(response)) return

        data && HttpClient.sendJSON(response, data)

        return
    }

    const controller = loaders().controller.getControllerByServiceScope({app, route, http})

        || loaders().controller.getControllerByRoute(app, route, http)

    if (!controller) throw new HttpException(http, {status: HTTP_STATUS.NOT_FOUND})

    const data = await controller[CONTROLLER_INITIAL_ACTION]()

    if (HttpClient.getResponseIsSent(response)) return

    if (data) return HttpClient.sendJSON(response, data)

    const action = controller.route.action || http.method

    if (HTTP_METHODS.includes(action) && action !== http.method) HttpClient.throwBadRequest()

    if (typeof controller[action] === 'function') {

        const args = app.router.arrangeRouteParams(route)

        const data = await controller[action].apply(controller, args)

        if (HttpClient.getResponseIsSent(response)) return

        data && HttpClient.sendJSON(response, data)

        return
    }

    HttpClient.throwNoContent()
})
