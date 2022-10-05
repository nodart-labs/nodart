import {Http2ServerRequest, Http2ServerResponse} from "http2";
import {App} from '../core/app'
import {HttpHandler} from "../core/http_handler";
import {StaticLoader} from "../loaders/static_loader";
import {HttpClient} from "../core/http_client";
import {HTTP_SERVICE_ACCEPTOR_COMMON_ACTION, HttpServiceHandler} from "../services/http";
import {HttpServiceRouteObject} from "../interfaces/service";
import {HttpServiceLoader} from "../loaders/http_service_loader";

export = async (app: App, request: Http2ServerRequest, response: Http2ServerResponse) => {

    const http = app.get('http').call([request, response]) as HttpClient

    /**************************************
     STATIC LOADER
    ***************************************/

    const staticLoader = <StaticLoader>app.get('static')

    const filePath = http.parseURL.pathname === '/' ? app.config.get.staticIndex : http.parseURL.pathname

    const file = staticLoader.require(filePath).call()

    if (file) return staticLoader.send(file, http)


    /**************************************
     HTTP SERVICE LOADER
    ***************************************/

    if (app.httpServiceRoutes.length) {

        const httpServiceHandler = new HttpServiceHandler(app.router, app.httpServiceRoutes)

        const runHttpService = async (filterRoute: (route: HttpServiceRouteObject) => boolean): Promise<true | void> => {

            const routeData = httpServiceHandler.getRouteData(filterRoute, http.parseURL)

            const routeObject = routeData ? httpServiceHandler.findRouteByRouteData(routeData) : null

            if (routeObject && routeData) {

                const scope = {http, route: routeData, app}

                await httpServiceHandler.runRoute(routeObject, scope, app.get('http_service') as HttpServiceLoader)

                return true
            }
        }

        await runHttpService((route) => route.action === HTTP_SERVICE_ACCEPTOR_COMMON_ACTION)

        if (http.responseIsSent) return

        const httpMethod = request.method.toLowerCase()

        if (await runHttpService((route) => route.action === httpMethod)) return
    }


    /**************************************
     CONTROLLER LOADER
    ***************************************/

    const handler = new HttpHandler(app, http)

    if (app.httpHandlerPayload) await app.httpHandlerPayload(handler)

    await handler.runController()
}
