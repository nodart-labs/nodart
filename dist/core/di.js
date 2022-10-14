"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injects = exports.uses = exports.refs = exports.DIManager = exports.DependencyInterceptor = exports.DIReference = exports.DIContainerDependency = exports.DIContainer = exports.CONTAINER_PREFIX_NAME = void 0;
const utils_1 = require("../utils");
const observer_1 = require("./observer");
const exception_1 = require("./exception");
exports.CONTAINER_PREFIX_NAME = 'di_container_';
class DIContainer {
    constructor(target) {
        var _a;
        this.target = target;
        this._references = {};
        this.prototype = target === null || target === void 0 ? void 0 : target.prototype;
        if (!((_a = this.prototype) === null || _a === void 0 ? void 0 : _a.constructor))
            throw new exception_1.RuntimeException('The constructor of a legitimate Class prototype must be used with the DI Container.');
    }
    get references() {
        return Object.assign({}, this._references);
    }
    setReferences(references) {
        Object.assign(this._references, references);
    }
    assignData(data) {
        this._references[data.reference] = data.payload;
        const { key, container } = DIContainer.getOrigin(this.prototype);
        key && container && DIContainer.setOrigin(key, this.prototype.constructor, this);
    }
    static create(target) {
        const container = new DIContainer(target);
        const hash = require('crypto').randomBytes(10).toString('hex');
        const key = DIContainer.setOrigin(hash, target.prototype.constructor, container);
        return { key, container };
    }
    static setOrigin(key, constructor, container) {
        DIContainer.origin[key] || (key = exports.CONTAINER_PREFIX_NAME + key + '_' + constructor.name);
        DIContainer.origin[key] = {
            constructor,
            container
        };
        return key;
    }
    static getOrigin(target) {
        var _a, _b, _c, _d;
        const source = target;
        const plate = { key: undefined, constructor: undefined, container: undefined };
        if (!(target = (_b = (_a = target === null || target === void 0 ? void 0 : target.prototype) === null || _a === void 0 ? void 0 : _a.constructor) !== null && _b !== void 0 ? _b : target === null || target === void 0 ? void 0 : target.constructor))
            return plate;
        const find = (pattern) => {
            for (const [key, { constructor, container }] of Object.entries(DIContainer.origin)) {
                if (!pattern(constructor))
                    continue;
                if (target.name !== constructor.name && source.prototype) {
                    const add = DIContainer.create(source);
                    add.container.setReferences(container.references);
                    add.container.onGetProperty = container.onGetProperty;
                    return { key: add.key, container: add.container, constructor: target };
                }
                return { key, constructor, container };
            }
        };
        return (_d = (_c = find((constructor) => constructor === target)) !== null && _c !== void 0 ? _c : find((constructor) => constructor.isPrototypeOf(target))) !== null && _d !== void 0 ? _d : plate;
    }
    static getOriginOrCreate(target) {
        return DIContainer.getOrigin(target).container || DIContainer.create(target).container;
    }
}
exports.DIContainer = DIContainer;
DIContainer.origin = {};
class DIContainerDependency {
    constructor() {
        this.injects = {};
        this.initial = {};
    }
    get container() {
        return this._container || (this._container = DIContainer.getOrigin(this.target).container);
    }
    static apply(target, property, referenceOrPayload) {
        const dep = new DIContainerDependency;
        Object.defineProperty(target, property, {
            get: dep._getter(property, referenceOrPayload),
            set: dep._setter(property),
            configurable: true,
            enumerable: true
        });
    }
    _getter(property, referenceOrPayload) {
        const dep = this;
        return function () {
            var _a;
            dep.target = this;
            const initial = dep.getInitial(property);
            const reference = typeof referenceOrPayload === 'string' ? referenceOrPayload : '';
            const payload = referenceOrPayload instanceof Function ? referenceOrPayload : null;
            let value = initial;
            value = dep.intercept(property, value, reference);
            payload && (value = payload(dep.target, property, value));
            ((_a = dep.container) === null || _a === void 0 ? void 0 : _a.references[reference || property]) instanceof Function && (value = dep.container.references[reference || property](dep.target, property, value));
            value === undefined && (value = initial);
            dep.set(property, value);
            return value;
        };
    }
    _setter(property) {
        const dep = this;
        return function (initial) {
            dep.clear(property);
            dep.setInitial(property, initial);
            return initial;
        };
    }
    set(propertyKey, injection) {
        injection !== undefined && (this.injects[propertyKey] = injection);
    }
    clear(propertyKey) {
        this.injects[propertyKey] !== undefined && delete this.injects[propertyKey];
        this.initial[propertyKey] !== undefined && delete this.initial[propertyKey];
    }
    setInitial(propertyKey, value) {
        value !== undefined && (this.initial[propertyKey] = value);
    }
    getInitial(propertyKey) {
        return this.initial[propertyKey];
    }
    intercept(propertyKey, value, reference) {
        var _a;
        const onGetProperty = (_a = this.container) === null || _a === void 0 ? void 0 : _a.onGetProperty;
        if (onGetProperty instanceof Function)
            return onGetProperty(propertyKey, value, reference);
        return value;
    }
}
exports.DIContainerDependency = DIContainerDependency;
class DIReference {
    constructor(references, mediator) {
        this.references = references;
        this.mediator = mediator;
    }
    setReferences(references) {
        Object.assign(this.references, references);
    }
    /**
     * Search reference matching argument.
     * @param referencePathLike
     * @param props
     */
    search(referencePathLike, props) {
        var _a;
        const { target, reference, entry } = DIReference.getReferenceEntry(referencePathLike, this.references);
        const output = { target, reference, entry };
        return (props === null || props === void 0 ? void 0 : props.filter) ? ((_a = props.filter(output)) !== null && _a !== void 0 ? _a : output) : output;
    }
    /**
     * Getting dependency by reference target.
     * @param referenceEntry
     * @param referenceTarget
     * @param props
     */
    getDependency(referenceEntry, referenceTarget, props) {
        var _a, _b;
        return (_b = (_a = this.references)[referenceEntry]) === null || _b === void 0 ? void 0 : _b.call(_a, this.mediator, referenceTarget, props);
    }
    get(referencePathLike, props) {
        const { entry, target } = this.search(referencePathLike);
        if (entry)
            return this.getDependency(entry, target, props);
    }
    static getReferenceEntry(referencePathLike, references) {
        const output = {
            reference: utils_1.$.trimPath(referencePathLike),
            entry: null,
            target: null
        };
        Object.keys(references).forEach(entry => {
            entry = utils_1.$.trimPath(entry);
            if (output.reference.startsWith(entry)) {
                output.entry = entry;
                output.target = output.reference.replace(entry + '/', '');
            }
        });
        return output;
    }
}
exports.DIReference = DIReference;
class DependencyInterceptor {
    constructor(interceptor, reference) {
        this.interceptor = interceptor;
        this.reference = reference;
    }
    get target() {
        return this.interceptor.getTarget();
    }
    get container() {
        return this._container || (this._container = DIContainer.getOrigin(this.target).container);
    }
    _getDependencyByReferenceTarget(reference) {
        if (!reference || !this.reference)
            return;
        const props = this.interceptor.getReferenceProps(reference);
        let dependency, target;
        if ((target = this.interceptor.getReferenceTarget(reference))) {
            dependency = this.reference.get(reference + '/' + target, props !== null && props !== void 0 ? props : []);
        }
        else if (reference.includes('/')) {
            const split = reference.split('/');
            target = reference.length > 1 ? split.at(-1) : null;
            target && (dependency = this.reference.get(split.slice(0, -1).join('/') + '/' + target, props ? props : []));
        }
        this.interceptor.onGetDependency(dependency);
        return dependency;
    }
    _interceptProperty(property, value, reference) {
        value = this.interceptor.onGetProperty(property, value, reference);
        this.interceptor.onGetDependency(value);
        return value !== undefined ? value : this._getDependencyByReferenceTarget(reference);
    }
    intercept() {
        this.container && (this.container.onGetProperty = (property, value, reference) => {
            reference || (reference = '');
            const resolve = this._interceptProperty(property, value, reference);
            if (resolve !== undefined)
                return utils_1.$.isPlainObject(resolve) ? this._observe(property, resolve, reference) : resolve;
            if (utils_1.$.isPlainObject(value))
                return this._observe(property, value, reference);
            return value;
        });
    }
    _observe(property, value, reference) {
        const observer = new observer_1.Observer(value, {
            get: (key, descriptor) => {
                var _a, _b;
                (_b = (_a = this.interceptor).onWatchProperty) === null || _b === void 0 ? void 0 : _b.call(_a, property, descriptor);
                const { prop, path, source } = descriptor;
                return this._interceptProperty(property, source, reference + '/' + (path.length ? path.join('/') + '/' + prop : prop));
            }
        });
        return observer.get;
    }
}
exports.DependencyInterceptor = DependencyInterceptor;
class DIManager {
    constructor(references, mediator) {
        references && (this._reference = new DIReference(references, mediator));
    }
    setReferences(references) {
        var _a;
        (_a = this._reference) === null || _a === void 0 ? void 0 : _a.setReferences(references);
    }
    reference(references, mediator) {
        var _a;
        return new DIReference(references, mediator !== null && mediator !== void 0 ? mediator : (_a = this._reference) === null || _a === void 0 ? void 0 : _a.mediator);
    }
    container(target) {
        return DIContainer.getOrigin(target).container;
    }
    interceptor(interceptor, reference) {
        return new DependencyInterceptor(interceptor, reference !== null && reference !== void 0 ? reference : this._reference);
    }
    use(target, reference, payload) {
        DIContainer.getOriginOrCreate(target).assignData({ reference, payload });
        return this;
    }
    inject(target, property, referenceOrPayload) {
        DIContainerDependency.apply(target, property, referenceOrPayload);
        return this;
    }
}
exports.DIManager = DIManager;
function refs(references) {
    return function (constructor) {
        DIContainer.getOriginOrCreate(constructor).setReferences(references);
    };
}
exports.refs = refs;
function uses(reference, payload) {
    return function (constructor) {
        DIContainer.getOriginOrCreate(constructor).assignData({ reference, payload });
    };
}
exports.uses = uses;
function injects(referenceOrPayload) {
    return function (target, propertyKey) {
        DIContainerDependency.apply(target, propertyKey, referenceOrPayload);
    };
}
exports.injects = injects;
//# sourceMappingURL=di.js.map