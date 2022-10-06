import {AppLoader} from "../core/app_loader";
import {HttpServiceScope} from "../interfaces/service";
import {HttpService} from "../services/http";
import {fs, object} from "../utils";
import {HttpRespond} from "../core/http_respond";
import {HttpClient} from "../core/http_client";
import {RuntimeException} from "../core/exception";
import {Session} from "../core/session";
import {Service} from "../core/service";
import {HttpHandler} from "../core/http_handler";

export class HttpServiceLoader extends AppLoader {

    protected _onCall(target: any) {

        this._target = HttpService

        this._target.prototype.model || this.constructProperty('model')

        this._target.prototype.service || this.constructProperty('service')
    }

    protected _resolve(target?: any, args?: [scope: HttpServiceScope]): any {

        const scope = args?.[0] ?? {}

        if (scope.http && !(scope.http instanceof HttpClient))
            throw new RuntimeException('HttpServiceLoader: missing required scope argument "HttpClient".')

        if (scope.route && !(("path" in scope.route) && ("pathname" in scope.route)))
            throw new RuntimeException('HttpServiceLoader: invalid scope argument "route".')

        scope.app ??= this._app

        if (scope.http) {
            scope.respond ??= this._app.get('http_respond').call([scope.http]) as HttpRespond
            scope.session ??= this._app.get('session').call([scope.http]) as Session
        }

        if (scope.http && scope.route) {
            const controller = HttpHandler.getControllerByRouteDescriptor(this._app, scope.route, scope.http)
            controller && (scope.controller = controller)
        }

        return this._target = new this._target(scope)
    }

    onGetDependency(target: any): void {

        if (target instanceof Service && this._pushDependency(target) && this._target instanceof HttpService) {

            const scope = this._target.scope as HttpServiceScope

            this.serviceScope = <HttpServiceScope>{
                model: scope.model,
                service: scope.service,
                http: scope.http,
                route: scope.route,
                session: scope.session,
                respond: scope.respond,
                controller: scope.controller
            }
        }

        super.onGetDependency(target)
    }

    constructProperty(name: 'model' | 'service') {

        this._target.prototype[name] = {}

        const repo = this._app.get(name).getRepo()

        fs.dir(repo, ({file}) => {

            if (!file) return

            const path = fs.skipExtension(fs.formatPath(file.replace(repo, ''))).replace('/', '.')

            path && object.set(this._target.prototype[name], path, {})

        })
    }

    protected _onGenerate(repository: string) {
    }

}
