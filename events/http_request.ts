import {Http2ServerRequest, Http2ServerResponse} from "http2";
import {App, loaders} from "../core/app";
import {JSON_CONTENT_TYPE, HttpClient} from "../core/http_client";
import {HTTP_METHODS, HTTP_STATUS} from "../core/interfaces/http";
import {HttpException} from "../core/exception";
import {CONTROLLER_INITIAL_ACTION} from "../core/controller";

const warnings = {
    useCors: false,
    fetchDataOnRequest: false
}

export = async (app: App, request: Http2ServerRequest, response: Http2ServerResponse) => {

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

        console.log('The CORS headers are disabled in configuration. Set "useCors" to enable if needed.')
    }

    /**************************************
     SERVE STATIC
     ***************************************/

    const path = loaders().static.call([app, config, response], request.url)

    if (false === path) return

    const sent = path && (await loaders().static.send(path as string, {
        app,
        mimeTypes: HttpClient.mimeTypes(configHttp.mimeTypes),
        request,
        response
    }))

    if (sent) return


    /**************************************
     FETCHING REQUEST DATA
     ***************************************/

    const url = HttpClient.getParsedURL(HttpClient.getURI(app.host) + request.url)

    const http = loaders().http.call([app, {request, response, url, host: app.host}])

    if (configHttp.fetchDataOnRequest) {

        ['POST', 'PUT', 'PATCH'].includes(request.method) && await http.fetchData()

    } else if (!warnings.fetchDataOnRequest) {

        warnings.fetchDataOnRequest = true

        console.log('Auto fetching data on request is disabled in configuration. Use "fetchData" method manually instead.')
    }

    /**************************************
     HTTP HANDLER
     ***************************************/

    const route = app.router.getRouteByURL(url, http.method)

    if (route.callback instanceof Function) {

        const service = loaders().httpService.call([{http, route, app}])

        const data = await route.callback(service.scope)

        if (HttpClient.getResponseIsSent(response)) return

        data && HttpClient.sendJSON(response, data)

        return
    }

    const controller = loaders().httpService.getController({app, route, http}, loaders().controller)

        || loaders().controller.getControllerByRoute(app, route, http)

    if (!controller) throw new HttpException(http, {status: HTTP_STATUS.NOT_FOUND})

    const data = await controller[CONTROLLER_INITIAL_ACTION]()

    if (HttpClient.getResponseIsSent(response)) return

    if (data) return HttpClient.sendJSON(response, data)

    const action = controller.route.action || http.method

    if (HTTP_METHODS.includes(action) && action !== http.method) HttpClient.throwBadRequest()

    if (controller[action] instanceof Function) {

        const args = app.router.arrangeRouteParams(route)

        const data = await controller[action].apply(controller, args)

        if (HttpClient.getResponseIsSent(response)) return

        data && HttpClient.sendJSON(response, data)

        return
    }

    HttpClient.throwNoContent()
}
