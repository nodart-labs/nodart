import {object} from "../utils";
import {ServiceScope} from "./interfaces/service";
import {HttpContainer} from "./http_client";
import {RouteData} from "./interfaces/router";
import {Model} from "./model";
import {App, loaders} from "./app";

export abstract class Service {

    constructor(protected _scope: ServiceScope = {}) {
    }

    setScope(scope: ServiceScope) {
        Object.assign(this._scope, scope)
    }

    mergeScope(scope: ServiceScope) {
        this._scope = object.merge(this._scope, scope)
    }

    fetchScope(pathDotted: string, def?: any) {
        return object.get(this._scope, pathDotted, def)
    }

    get scope(): ServiceScope {
        return this._scope
    }
}

export class ServiceFactory {

    constructor(readonly app: App) {
    }

    createServiceScope(http: HttpContainer, route: RouteData): ServiceScope {

        const dependencies = {
            service: undefined,
            model: undefined
        }

        const status = {
            service: false,
            model: false
        }

        const scope = <ServiceScope>{
            app: this.app,
            route,
            http,
            service: () => intercept('service'),
            model: () => intercept('model'),
            controller: () => loaders().controller.getControllerByServiceScope(scope),
        }

        const intercept = (property: 'service' | 'model') => {
            if (status[property] === false) {
                status[property] = true
                this.app.di.inject(dependencies, property, property)
                this.app.di.intercepted(dependencies) || this.app.di.intercept(dependencies, this.app.factory.createDependencyInterceptor({
                    getDependency(dependencies: object, property: string, dependency: any): any {
                        switch (property) {
                            case 'service':
                                return Reflect.construct(dependency, [scope])
                            case 'model':
                                return loaders().model.call([scope.app, dependency as typeof Model])
                        }
                    }
                }))
            }

            return dependencies[property]
        }

        return scope
    }

}
