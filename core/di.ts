import {$} from "../utils";
import {Observer, typeObserverDescriptor} from "./observer";

export type typeDIContainerDependencyPayload = (instance: any, property: string, value?: any) => any

export type typeDIContainerAssignData = {
    reference: string,
    payload?: typeDIContainerDependencyPayload
}

export type typeDIContainerReferenceEntries = {
    [reference: string]: typeDIContainerDependencyPayload
}

export type typeDIOriginContainers = {
    [key: string]: {
        constructor: any,
        container: DIContainer
    }
}

export const CONTAINER_PREFIX_NAME = 'di_container_'

export class DIContainer implements PropertyInterceptorInterface {

    private static origin: typeDIOriginContainers = {}

    readonly prototype: any

    protected _references: typeDIContainerReferenceEntries = {}

    onGetProperty: undefined

    constructor(readonly target: any) {

        this.prototype = target?.prototype

        if (!this.prototype?.constructor) throw 'The DI Container must be applied to a valid Class prototype\'s constructor.'
    }

    get references() {
        return {...this._references}
    }

    setReferences(references: typeDIContainerReferenceEntries) {
        Object.assign(this._references, references)
    }

    assignData(data: typeDIContainerAssignData) {
        this._references[data.reference] = data.payload
        const {key, container} = DIContainer.getOrigin(this.prototype)
        key && container && DIContainer.setOrigin(key, this.prototype.constructor, this)
    }

    static create(target: any) {
        const container = new DIContainer(target)
        const hash = (Math.random() * 100).toString().replace('.', '')
        const key = DIContainer.setOrigin(hash, target.prototype.constructor, container)
        return {key, container}
    }

    static setOrigin(key: string, constructor: any, container: DIContainer) {
        DIContainer.origin[key] || (key = CONTAINER_PREFIX_NAME + key + '_' + constructor.name)
        DIContainer.origin[key] = {
            constructor,
            container
        }
        return key
    }

    static getOrigin(target: any) {

        const source = target
        const plate = {key: undefined, constructor: undefined, container: undefined}

        if (!(target = target?.prototype?.constructor ?? target?.constructor)) return plate

        const find = (pattern: (constructor: any) => boolean) => {
            for (const [key, {constructor, container}] of Object.entries(DIContainer.origin)) {
                if (!pattern(constructor)) continue
                if (target.name !== constructor.name && source.prototype) {
                    const add = DIContainer.create(source)
                    add.container.setReferences(container.references)
                    add.container.onGetProperty = container.onGetProperty
                    return {key: add.key, container: add.container, constructor: target}
                }
                return {key, constructor, container}
            }
        }

        return find((constructor) => constructor === target)
            ?? find((constructor) => constructor.isPrototypeOf(target))
            ?? plate
    }

    static getOriginOrCreate(target: any) {
        return DIContainer.getOrigin(target).container || DIContainer.create(target).container
    }
}

export class DIContainerDependency {

    injects: object = {}

    initial: object = {}

    target: any

    protected _container: DIContainer

    get container(): DIContainer | undefined {

        return this._container ||= DIContainer.getOrigin(this.target).container
    }

    static apply(target: any, property: string, referenceOrPayload: string | typeDIContainerDependencyPayload) {

        const dep = new DIContainerDependency

        Object.defineProperty(target, property, {
            get: dep._getter(property, referenceOrPayload),
            set: dep._setter(property),
            configurable: true,
            enumerable: true
        })
    }

    protected _getter(property: string, referenceOrPayload: string | typeDIContainerDependencyPayload) {

        const dep = this

        return function () {

            dep.target = this

            const initial = dep.getInitial(property)

            const reference = typeof referenceOrPayload === 'string' ? referenceOrPayload : ''

            const payload = referenceOrPayload instanceof Function ? referenceOrPayload : null

            let value = initial

            value = dep.intercept(property, value, reference)

            payload && (value = payload(dep.target, property, value))

            dep.container?.references[reference || property] instanceof Function && (

                value = dep.container.references[reference || property](dep.target, property, value)
            )

            value === undefined && (value = initial)

            dep.set(property, value)

            return value
        }
    }

    protected _setter(property: string) {

        const dep = this

        return function (initial: any) {
            dep.clear(property)
            dep.setInitial(property, initial)
            return initial
        }
    }

    set(propertyKey: string, injection: any) {

        injection !== undefined && (this.injects[propertyKey] = injection)
    }

    clear(propertyKey: string) {

        this.injects[propertyKey] !== undefined && delete this.injects[propertyKey]
        this.initial[propertyKey] !== undefined && delete this.initial[propertyKey]
    }

    setInitial(propertyKey: string, value: any) {

        value !== undefined && (this.initial[propertyKey] = value)
    }

    getInitial(propertyKey: string) {

        return this.initial[propertyKey]
    }

    intercept(propertyKey: string, value: any, reference?: any) {

        const onGetProperty = this.container?.onGetProperty ?? {}

        if (onGetProperty instanceof Function) return onGetProperty(propertyKey, value, reference)

        return value
    }
}

export type typeReferenceEntries = {
    [referencePathLike: string]: typeReferencePayload
}

export type typeSearchReferenceFilterData = { target: string, reference: string, entry: string }

export type typeSearchReferenceProps = {
    filter?: (data: typeSearchReferenceFilterData) => typeSearchReferenceFilterData,
}

export type typeReferencePayload = (mediator: any, target: string, targetProps?: any[]) => any

export class DIReference {

    constructor(
        readonly references: typeReferenceEntries,
        readonly mediator?: any) {
    }

    setReferences(references: typeReferenceEntries) {

        Object.assign(this.references, references)
    }

    /**
     * Search reference matching argument.
     * @param referencePathLike
     * @param props
     */
    search(referencePathLike: string, props?: typeSearchReferenceProps) {

        const {target, reference, entry} = DIReference.getReferenceEntry(referencePathLike, this.references)

        const output = {target, reference, entry}

        return props?.filter ? (props.filter(output) ?? output) : output
    }

    /**
     * Getting dependency by reference target.
     * @param referenceEntry
     * @param referenceTarget
     * @param props
     */
    getDependency(referenceEntry: string, referenceTarget: string, props?: any[]) {

        return this.references[referenceEntry]?.(this.mediator, referenceTarget, props)
    }

    get(referencePathLike: string, props?: any[]) {

        const {entry, target} = this.search(referencePathLike)

        if (entry) return this.getDependency(entry, target, props)
    }

    static getReferenceEntry(referencePathLike: string, references: typeReferenceEntries) {

        const output = {
            reference: $.trimPath(referencePathLike),
            entry: null,
            target: null
        }

        Object.keys(references).forEach(entry => {
            entry = $.trimPath(entry)

            if (output.reference.startsWith(entry)) {
                output.entry = entry
                output.target = output.reference.replace(entry + '/', '')
            }
        })

        return output
    }

}

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

export class DependencyInterceptor {

    protected _container?: DIContainer

    constructor(
        readonly interceptor: DependencyInterceptorInterface,
        readonly reference?: DIReference) {
    }

    get target() {

        return this.interceptor.getTarget()
    }

    get container() {

        return this._container ||= DIContainer.getOrigin(this.target).container
    }

    protected _getDependencyByReferenceTarget(reference: string) {

        if (!reference || !this.reference) return

        const props = this.interceptor.getReferenceProps(reference)

        let dependency, target

        if ((target = this.interceptor.getReferenceTarget(reference))) {

            dependency = this.reference.get(reference + '/' + target, props ? props : [])

        } else if (reference.includes('/')) {

            const split = reference.split('/')

            target = reference.length > 1 ? split.at(-1) : null

            target && (dependency = this.reference.get(split.slice(0, -1).join('/') + '/' + target, props ? props : []))
        }

        this.interceptor.onGetDependency(dependency)

        return dependency
    }

    protected _interceptProperty(property: string, value: any, reference?: string) {

        value = this.interceptor.onGetProperty(property, value, reference)

        this.interceptor.onGetDependency(value)

        return value !== undefined ? value : this._getDependencyByReferenceTarget(reference)
    }

    intercept() {

        this.container && (this.container.onGetProperty = (property: string, value: any, reference?: string) => {

            reference ||= ''

            const resolve = this._interceptProperty(property, value, reference)

            if (resolve !== undefined)

                return $.isPlainObject(resolve) ? this._observe(property, resolve, reference) : resolve

            if ($.isPlainObject(value)) return this._observe(property, value, reference)

            return value
        })
    }

    protected _observe(property: string, value: any, reference: string) {

        const observer = new Observer(value, {

            get: (key: string, descriptor: typeObserverDescriptor) => {

                const {prop, path, source, isTarget} = descriptor

                if (isTarget) {

                    return this._interceptProperty(
                        property,
                        source,
                        reference + '/' + (path.length ? path.join('/') + '/' : '') + prop.toString()
                    )
                }

                return source?.[prop]
            }
        })

        return observer.get
    }
}

export class DIManager {

    protected _reference?: DIReference

    constructor(references?: typeReferenceEntries, mediator?: any) {

        references && (this._reference = new DIReference(references, mediator))
    }

    setReferences(references: typeReferenceEntries) {

        this._reference?.setReferences(references)
    }

    reference(references: typeReferenceEntries, mediator?: any) {

        return new DIReference(references,  mediator ?? this._reference?.mediator)
    }

    container(target: any): DIContainer | undefined {

        return DIContainer.getOrigin(target).container
    }

    interceptor(interceptor: DependencyInterceptorInterface, reference?: DIReference) {

        return new DependencyInterceptor(interceptor, reference ?? this._reference)
    }

    use(target: any, reference: string, payload?: typeDIContainerDependencyPayload) {

        DIContainer.getOriginOrCreate(target).assignData(<typeDIContainerAssignData>{reference, payload})

        return this
    }

    inject(target: any, property: string, referenceOrPayload: string | typeDIContainerDependencyPayload) {

        DIContainerDependency.apply(target, property, referenceOrPayload)

        return this
    }

}

export function refs(references: typeDIContainerReferenceEntries) {
    return function (constructor: any) {
        DIContainer.getOriginOrCreate(constructor).setReferences(references)
    }
}

export function uses(reference: string, payload?: typeDIContainerDependencyPayload) {
    return function (constructor: any) {
        DIContainer.getOriginOrCreate(constructor).assignData(<typeDIContainerAssignData>{reference, payload})
    }
}

export function injects(referenceOrPayload: string | typeDIContainerDependencyPayload) {
    return function (target: any, propertyKey: string) {
        DIContainerDependency.apply(target, propertyKey, referenceOrPayload)
    }
}
