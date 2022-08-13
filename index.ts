import {App} from "./core/app";
import {Controller} from "./core/controller";
import {Route as RouteMiddleware, typeRouteScope} from "./middlewares/route";

export declare type typeRouteScopeDispatch = typeRouteScope & {route: RouteMiddleware}

export namespace dispatch {
    export const Route = function (call: (scope: typeRouteScopeDispatch) => void): RouteMiddleware {
        const route = new RouteMiddleware()
        call({...route.scope, ...{route}})
        return route
    }
}

export {
    App,
    Controller
}
