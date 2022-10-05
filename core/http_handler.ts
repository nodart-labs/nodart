import {App} from "./app";
import {HttpClient} from "./http_client";
import {RouteData} from "../interfaces/router";
import {Controller, CONTROLLER_INITIAL_ACTION, CONTROLLER_HTTP_ACTIONS} from "./controller";
import {DEFAULT_CONTROLLER_NAME} from "./app_config";
import {AppLoader} from "./app_loader";
import {ControllerLoader} from "../loaders/controller_loader";
import {HttpException, RuntimeException} from "./exception";
import {object, $} from "../utils";

export class HttpHandler {

    protected _controller: Controller

    constructor(readonly app: App, readonly httpClient: HttpClient) {
    }

    get controller(): Controller | null {

        return this._controller instanceof Controller ? this._controller : this._controller = null
    }

    set controller(instance: Controller | null) {

        this._controller = instance
    }

    static getControllerLoader(app: App, type?: typeof Controller): ControllerLoader {

        const loader = app.get('controller') as ControllerLoader

        if (type && false === object.isProtoConstructor(type, Controller)) {

            throw new RuntimeException(
                `HttpHandler: The type "${object.getProtoConstructor(type)?.name}" that was provided is an invalid Controller class.`
            )
        }

        type && loader.setTarget(type)

        return loader
    }

    getRoute() {

        return this.app.router.httpRoute(this.httpClient)
    }

    async getController(route?: RouteData, httpClient?: HttpClient): Promise<Controller | void> {

        if (this.controller) return this.controller

        route ??= this.getRoute()

        httpClient ??= this.httpClient

        const controller = HttpHandler.getControllerByRouteDescriptor(this.app, route, httpClient)

        if (controller instanceof Controller) {

            this.controller = controller

            return this.controller
        }

        const loader = HttpHandler.getControllerLoader(this.app)

        const {path, action} = HttpHandler.getControllerPathAndActionByRoute(route, loader)

        if (path) {

            this.controller = await loader.require(path).call([httpClient, route])

            this.controller && (this.controller.route.action = action)

            return this.controller
        }
    }

    static getControllerByRouteDescriptor(app: App, route: RouteData, httpClient: HttpClient): Controller | void {

        const controller = route.controller?.(route)

        if (controller) return HttpHandler.getControllerLoader(app, controller).call([httpClient, route])
    }

    async runController(): Promise<any> {

        const controller = this.controller ??= (await this.getController() as Controller)

        if (!controller) throw new HttpException(this.httpClient.getHttpResponse({status: 404}))

        const httpMethod = this.httpClient.request.method.toLowerCase()

        const action = controller.route.action ||= httpMethod

        await controller[CONTROLLER_INITIAL_ACTION]()

        if (action !== controller.route.action || controller.http.responseIsSent) return

        if (CONTROLLER_HTTP_ACTIONS.includes(action) && action !== httpMethod)

            throw new HttpException('The current HTTP method receives no response from the request method.', {status: 400})

        const args = this.app.router.arrangeRouteParams(controller.route)

        if (controller[action] instanceof Function) {

            const data = await controller[action].apply(controller, args)

            if (controller.http.responseIsSent) return

            if ($.isPlainObject(data) || typeof data === 'string') controller.send.data(data)

            return data
        }
    }

    static getControllerPathAndActionByRoute(route: RouteData, loader: AppLoader) {

        const data = {path: '', action: ''}

        if (route.route) {
            data.path = route.route
            data.action = route.action ?? ''
            return data
        }

        const pathname = route.pathname

        let path = pathname === '/' ? DEFAULT_CONTROLLER_NAME : pathname

        if (loader.isSource(path)) {
            data.path = path
            return data
        }

        const splitPath = pathname.split('/')

        path = splitPath.slice(0, -1).join('/')

        if (loader.isSource(path)) {
            data.path = path
            data.action = splitPath.at(-1)
            return data
        }

        return data
    }
}
