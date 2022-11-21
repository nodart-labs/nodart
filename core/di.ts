import {Observer} from "./observer";
import {
    DependencyInterceptorInterface,
    DependencyScope,
    DIScope,
    InjectionContainer,
    InjectionProperty
} from "./interfaces/di";

export abstract class DependencyInterceptor implements DependencyInterceptorInterface {

    abstract getDependency(acceptor: any, property: string, dependency: any): any
}

export class BaseDependencyInterceptor extends DependencyInterceptor {

    getDependency(acceptor: any, property: string, dependency: any): any {
    }
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

        scope.references && typeof scope.references === 'object' && scope.references.constructor === Object && Object.assign(

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

            dependency = scope.dependency || this.getDependencyByReference(scope)

            if (dependency && typeof dependency === 'object' && dependency.constructor === Object)

                return this.watchDependency(scope, dependency)
        }

        return dependency?.prototype?.constructor ? DIContainer.resolve(dependency, scope) : null
    }

    private static resolve(dependency: Object, scope: DependencyScope) {

        return scope.interceptor ? scope.interceptor.getDependency(scope.acceptor, scope.property, dependency) : dependency
    }

    private watchDependency(scope: DependencyScope, dependency: object) {

        return new Observer(dependency, {

            get: (property, descriptor) => {

                return this.getDependency(scope, descriptor.value || null)
            },

        }).get
    }

    private static container(target: object, property?: string, injection?: InjectionProperty): InjectionContainer {

        const container = target[DIContainer.id] ||= {
            props: {},
            intercept: (property: string) => container.props[property]?.value
        } as InjectionContainer

        if (property) {

            container.props[property] ||= {}

            const {reference, value, dependency} = injection || {}

            container.props[property].value = value
            reference && (container.props[property].reference = reference)
            dependency && (container.props[property].dependency = dependency)

            value?.prototype?.constructor && (container.props[property].dependency = value)
        }

        return container
    }

    intercept(
        acceptor: object,
        interceptor?: DependencyInterceptorInterface,
        interceptors?: {[property: string]: DependencyInterceptorInterface}) {

        if (!DIContainer.injectable(acceptor)) return

        const container = DIContainer.container(acceptor)

        container.intercept = (property: string, reference?: string, dependency?: Object) => {

            container.props[property] ||= {} as InjectionProperty

            return this.getDependency({
                container: this,
                acceptor,
                reference: reference || container.props[property].reference,
                dependency: container.props[property].dependency || dependency,
                value: container.props[property].value,
                interceptor: interceptors?.[property] || interceptor,
                property,
            })
        }
    }

    use(acceptor: object, interceptor: DependencyInterceptorInterface) {

        this.intercepted(acceptor) || this.intercept(acceptor, interceptor)
    }

    inject(target: object, property: string, reference: string, dependency?: Object) {

        DIContainer.defineProperty(target, property, reference, dependency)
    }

    intercepted(target: object): boolean {

        return target[DIContainer.id]?.intercept !== undefined
    }

    static injectable(target: any): boolean {

        return !!(target && typeof target === 'object')
    }

    static defineProperty(target: object, property: string, reference: string, dependency?: Object) {

        DIContainer.injectable(target) && Object.defineProperty(target, property, {
            get: function () {
                return DIContainer.container(this).intercept(property, reference, dependency)
            },
            set: function (value) {
                return DIContainer.container(this, property, {reference, dependency, value}).props[property].value
            },
            configurable: true,
            enumerable: true
        })
    }
}

export function injects(reference: string, dependency?: Object) {
    return function (target: any, property: string) {
        DIContainer.defineProperty(target, property, reference, dependency)
    }
}
