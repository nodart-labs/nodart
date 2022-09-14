import {App} from "./app";
import {HttpClient} from "./http_client";
import {RouteData} from "../interfaces/router";
import {Controller, CONTROLLER_INITIAL_ACTION, CONTROLLER_HTTP_ACTIONS} from "./controller";
import {DEFAULT_CONTROLLER_NAME} from "./app_config";
import {AppLoader} from "./app_loader";
import {ControllerLoader} from "../loaders/controller_loader";
import {HttpException} from "./exception";

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

    async getController(route?: RouteData, httpClient?: HttpClient): Promise<Controller | void> {

        route ||= this.getRoute()

        httpClient ||= this.httpClient

        const {path, action} = HttpHandler.getRoutePathData(route, this.controllerLoader)

        if (path) {

            this.action = action

            return await this.controllerLoader.require(path).call([httpClient, route])
        }
    }

    async runController(controller?: Controller, action?: string, args?: any[]): Promise<any> {

        controller ||= await this.getController() as Controller

        if (!(controller instanceof Controller)) {

            throw new HttpException(this.httpClient.getHttpResponse({status: 404}))
        }

        action = this.fetchControllerAction(controller, action || controller.route?.action)

        args ||= (controller.route ? this.app.router.arrangeRouteParams(controller.route) : [])

        await controller[CONTROLLER_INITIAL_ACTION]()

        controller.route && (controller.route.action = action)

        if (controller[action] instanceof Function) return await controller[action].apply(controller, args)
    }

    fetchControllerAction(controller: Controller, action?: string) {

        const httpMethod = controller.http.request.method.toLowerCase()

        action ||= (this.action || httpMethod)

        if (CONTROLLER_HTTP_ACTIONS.includes(action) && action !== httpMethod) {

            throw new HttpException(this.httpClient.getHttpResponse({status: 400}))
        }

        return action
    }

    static getRoutePathData(route: RouteData, loader: AppLoader) {

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
