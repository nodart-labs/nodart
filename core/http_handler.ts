import {App} from "./app";
import {HttpClient} from "./http_client";
import {typeDataRoute} from "./router";
import {Controller, CONTROLLER_INITIAL_ACTION, CONTROLLER_HTTP_ACTIONS} from "./controller";
import {DEFAULT_CONTROLLER_NAME} from "./app_config";
import {AppLoader} from "./app_loader";
import {ControllerLoader} from "../loaders/controller_loader";

export class HttpHandler {

    readonly controllerLoader: ControllerLoader

    private action: string

    constructor (
        readonly app: App,
        readonly httpClient: HttpClient) {

        this.controllerLoader = <ControllerLoader>app.get('controller')
    }

    getRoute() {
        return this.app.router.httpRoute(this.httpClient)
    }

    async getController(route?: typeDataRoute, httpClient?: HttpClient): Promise<Controller | void> {

        route ||= this.getRoute()

        httpClient ||= this.httpClient

        const {path, action} = HttpHandler.getControllerPathData(route, this.controllerLoader)

        if (path) {

            this.action = action

            return await this.controllerLoader.require(path).call([httpClient, route])
        }
    }

    async runController(controller?: Controller, action?: string, args?: any[]): Promise<any> {

        const target = controller ?? await this.getController()

        if (!(target instanceof Controller)) return

        action = this.getValidatedControllerAction(target, action || target.route?.data.action)

        args ||= (target.route?.data ? this.app.router.arrangeRouteParams(target.route.data) : [])

        await target[CONTROLLER_INITIAL_ACTION]()

        target.route && (target.route.data.action = action)

        if (target[action] instanceof Function) return await target[action].apply(target, args)
    }

    getValidatedControllerAction(controller: Controller, action?: string) {

        const httpMethod = controller.http.request.method.toLowerCase()

        action ||= (this.action || httpMethod)

        if (CONTROLLER_HTTP_ACTIONS.includes(action) && action !== httpMethod)

            throw `The action "${action}" not responds to the HTTP method "${httpMethod.toUpperCase()}" in the "${controller.constructor.name}".`

        return action
    }

    static getControllerPathData(route: typeDataRoute, loader: AppLoader) {

        const data = {path: '', action: ''}

        if (route.route) {
            data.path = route.route
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
