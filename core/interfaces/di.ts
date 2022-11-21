import {DependencyInterceptor, DIContainer} from "../di";

export type DIReference = {
    [reference: string]: (mediator: any, property: string, value: any, acceptor: object) => any
}

export type DIScope = {
    mediator?: any
    references?: DIReference

    [addon: string]: any
}

export type DependencyScope = {
    acceptor: object
    reference: string
    dependency?: Object
    container: DIContainer
    property: string
    value: any
    interceptor?: DependencyInterceptor
}

export type InjectionContainer = {
    props: { [property: string]: InjectionProperty }
    intercept(property: string, reference?: string, dependency?: Object): any
}

export type InjectionProperty = {
    value: any
    reference: string
    dependency?: Object
}

export interface DependencyInterceptorInterface {
    getDependency(acceptor: any, property: string, dependency: any): any
}
