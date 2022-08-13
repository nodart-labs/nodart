import {AppLoader} from "../core/app_loader";
import {Controller} from "../core/controller"
import {HttpClient} from "../core/http_client";
import {typeDataRoute} from "../core/router";
import {Middleware} from "../core/middleware";
import {Route} from "../middlewares/route";
import {HttpHandler} from "../core/http_handler";
import {fs} from "../utils";

export type typeControllerLoaderConstruct = [
    http: HttpClient,
    route: typeDataRoute,
]

export const CONTROLLER_ROUTE_MIDDLEWARE_REPO = 'route'

export class ControllerLoader extends AppLoader {

    protected _repository = 'controllers'

    protected _pathSuffix = '_controller'

    protected _http: HttpClient

    protected _route: typeDataRoute

    protected _controller: Controller

    get scope() {
        return {
            app: this._app,
            http: this._http,
            controller: this._controller,
        }
    }

    protected _onCall(controller?: typeof Controller, args?: typeControllerLoaderConstruct) {

        if (!controller) return

        const [http, route] = args ?? []

        this._targetPath = HttpHandler.getControllerPathData(route, this).path

        this._route = route

        this._http = http
    }

    protected _resolve(controller?: typeof Controller): any {

        if (!controller) return

        this._controller = <Controller>(Reflect.construct(controller, [this._app, this._http]))

        if (!(this._controller instanceof Controller)) return

        this._controller.route instanceof Route || this.assignRouteMiddleware(this.getRouteMiddleware())

        return this._controller
    }

    assignRouteMiddleware(route: Route) {

        this._controller instanceof Controller && Object.assign(this._controller, {route})
    }

    getRouteMiddleware(): Route {

        const loader = this.intersectLoader('middleware', CONTROLLER_ROUTE_MIDDLEWARE_REPO)

        let routeMiddleware = <Route>loader?.call([this._route, this.scope])

        routeMiddleware instanceof Route || (routeMiddleware = new Route(this._route, this.scope))

        if (!routeMiddleware.data) {

            routeMiddleware.data = this._route

            routeMiddleware.setScope(this.scope)
        }

        return routeMiddleware
    }

    onGetDependency = (target: any) => {

        target instanceof Middleware && target.setScope(this.scope)
    }

    protected _onGenerate(repository: string) {

        const middlewareLoader = this._app.get('middleware')

        const middlewareRepo = middlewareLoader.getRepo()

        const routeMiddlewareRepo = middlewareRepo + '/' + CONTROLLER_ROUTE_MIDDLEWARE_REPO

        middlewareRepo && !fs.isDir(routeMiddlewareRepo) && fs.mkdir(routeMiddlewareRepo)
    }

}
