import {DIContainer} from "../core/di";

export type DIContainerDependencyPayload = (instance: any, property: string, value?: any) => any

export type DIContainerAssignData = {
    reference: string,
    payload?: DIContainerDependencyPayload
}

export type DIContainerReferenceEntries = {
    [reference: string]: DIContainerDependencyPayload
}

export type DIOriginContainers = {
    [key: string]: {
        constructor: any,
        container: DIContainer
    }
}

export type DIReferenceEntries = {
    [referencePathLike: string]: DIReferencePayload
}

export type DISearchReferenceFilterData = { target: string, reference: string, entry: string }

export type DISearchReferenceProps = {
    filter?: (data: DISearchReferenceFilterData) => DISearchReferenceFilterData,
}

export type DIReferencePayload = (mediator: any, target: string, targetProps?: any[]) => any

export interface PropertyInterceptorInterface {

    onGetProperty: (property: string, value: any, reference?: string) => any
}

export interface DependencyInterceptorInterface extends PropertyInterceptorInterface {

    getTarget(): any

    onGetDependency: (target: any) => void

    getReferenceTarget: (reference: string) => string | void

    getReferenceProps: (reference: string) => any[] | void

    intercept(): void
}
