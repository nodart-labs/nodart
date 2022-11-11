import {Observer} from "./observer";
import {DependencyScope, DIScope, InjectionContainer, InjectionProperty} from "./interfaces/di";

export abstract class DependencyInterceptor {

    abstract getDependency(acceptor: any, property: string, dependency: any): any

}

const CONTAINER_ID = require('crypto').randomBytes(20).toString('hex')

export class DIContainer {

    private static id: string = CONTAINER_ID

    private scope: DIScope = {}

    constructor(scope: DIScope = {}) {

        this.setScope(scope)
    }

    setScope(scope: DIScope = {}) {

        this.scope.references ||= {}

        scope.mediator && (this.scope.mediator = scope.mediator)

        scope.references instanceof Object && scope.references.constructor === Object && Object.assign(

            this.scope.references,

            scope.references
        )
    }

    getDependencyByReference(scope: DependencyScope) {

        return scope.container.scope.references[scope.reference]?.(
            scope.container.scope.mediator,
            scope.property,
            scope.value,
            scope.acceptor,
        )
    }

    private getDependency(scope: DependencyScope, dependency?: any): any {

        if (dependency === undefined) {

            if (scope.value?.prototype?.constructor) return DIContainer.resolve(dependency, scope)

            dependency = this.getDependencyByReference(scope)

            if (dependency instanceof Object && dependency.constructor === Object)

                return this.watchDependency(scope, dependency)
        }

        return dependency?.prototype?.constructor ? DIContainer.resolve(dependency, scope) : null
    }

    private static resolve(dependency: object, scope: DependencyScope) {

        return scope.interceptor ? scope.interceptor.getDependency(scope.acceptor, scope.property, dependency) : dependency
    }

    private watchDependency(scope: DependencyScope, dependency: object) {

        return new Observer(dependency, {

            get: (property, descriptor) => {

                return this.getDependency(scope, descriptor.value || null)
            },

        }).get
    }

    private static container(target: object, property?: string, reference?: string): InjectionContainer {

        const container = target[DIContainer.id] ||= {
            props: {},
            intercept: (property: string) => container.props[property]?.value
        } as InjectionContainer

        if (property) {
            container.props[property] ||= {}
            reference && (container.props[property].reference = reference)
        }

        return container
    }

    intercept(acceptor: object, interceptor?: DependencyInterceptor, interceptors?: {[property: string]: DependencyInterceptor}) {

        if (!DIContainer.injectable(acceptor)) return

        const container = DIContainer.container(acceptor)

        container.intercept = (property: string, reference: string) => {

            container.props[property] ||= {} as InjectionProperty

            return this.getDependency({
                container: this,
                acceptor,
                reference,
                value: container.props[property].value,
                interceptor: interceptors?.[property] || interceptor,
                property,
            })
        }
    }

    static injectable(target: any): boolean {

        return target instanceof Object && !target.prototype?.constructor
    }

    static inject(target: object, property: string, reference: string) {

        DIContainer.injectable(target) && Object.defineProperty(target, property, {
            get: function () {
                return DIContainer.container(this).intercept(property, reference)
            },
            set: function (value) {
                return DIContainer.container(this, property, reference).props[property].value = value
            },
            configurable: true,
            enumerable: true
        })
    }
}

export function injects(reference: string) {
    return function (target: any, property: string) {
        DIContainer.inject(target, property, reference)
    }
}
