import {Http2ServerRequest, Http2ServerResponse} from "http2";
import {App} from '../core/app'
import {HttpHandler} from "../core/http_handler";
import {StaticLoader} from "../loaders/static_loader";
import {HttpClient} from "../core/http_client";
import {HTTP_SERVICE_ACCEPTOR_COMMON_ACTION, HttpServiceHandler} from "../services/http";
import {HttpServiceRouteObject} from "../interfaces/service";
import {HttpServiceLoader} from "../loaders/http_service_loader";

let warnings = false

export = async (app: App, request: Http2ServerRequest, response: Http2ServerResponse) => {

    const http = app.get('http').call([request, response]) as HttpClient

    if (http.responseIsSent) return

    /**************************************
     CORS LOADER
     ***************************************/

    http.setCorsHeaders()

    if (request.method === 'OPTIONS') http.send('')


    /**************************************
     STATIC LOADER
     ***************************************/

    const staticLoader = <StaticLoader>app.get('static')

    const filePath = http.parseURL.pathname === '/' ? app.config.get.staticIndex : http.parseURL.pathname

    const file = staticLoader.require(filePath).call()

    if (file) return staticLoader.send(file, http)


    /**************************************
     FETCH REQUEST DATA (POST, PUT, PATCH)
     ***************************************/

    if (app.config.get.fetchDataOnRequest === true) {

        await http.fetchData()

    } else if (!warnings) {

        warnings = true

        console.log('Auto fetching data from request is disabled in configuration. Use "http.fetchData()" instead.')
    }


    /**************************************
     HTTP SERVICE LOADER
     ***************************************/

    if (app.httpServiceRoutes.length) {

        const httpServiceHandler = new HttpServiceHandler(app.router, app.httpServiceRoutes)

        const runHttpService = async (filterRoute: (route: HttpServiceRouteObject) => boolean): Promise<true | void> => {

            const route = httpServiceHandler.getRouteData(filterRoute, http.parseURL)

            const routeObject = route ? httpServiceHandler.findRouteByRouteData(route) : null

            if (routeObject && route) {

                const scope = {http, route, app}

                await httpServiceHandler.runService(routeObject, scope, app.get('http_service') as HttpServiceLoader)

                return true
            }
        }

        await runHttpService((route) => route.action === HTTP_SERVICE_ACCEPTOR_COMMON_ACTION)

        if (http.responseIsSent || (await runHttpService((route) => {
            return route.action === request.method.toLowerCase()
        }))) return
    }


    /**************************************
     CONTROLLER LOADER
     ***************************************/

    const handler = new HttpHandler(app, http)

    if (app.httpHandlerPayload) await app.httpHandlerPayload(handler)

    await handler.runController()
}
