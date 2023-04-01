"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injects = exports.DIContainer = exports.BaseDependencyInterceptor = exports.DependencyInterceptor = void 0;
const observer_1 = require("./observer");
class DependencyInterceptor {
}
exports.DependencyInterceptor = DependencyInterceptor;
class BaseDependencyInterceptor extends DependencyInterceptor {
    getDependency(acceptor, property, dependency) {
    }
}
exports.BaseDependencyInterceptor = BaseDependencyInterceptor;
const CONTAINER_ID = require('crypto').randomBytes(20).toString('hex');
class DIContainer {
    constructor(scope = {}) {
        this.scope = {};
        this.setScope(scope);
    }
    setScope(scope = {}) {
        var _a;
        (_a = this.scope).references || (_a.references = {});
        scope.mediator && (this.scope.mediator = scope.mediator);
        scope.references && typeof scope.references === 'object' && scope.references.constructor === Object && Object.assign(this.scope.references, scope.references);
    }
    getDependencyByReference(scope) {
        var _a, _b;
        return (_b = (_a = scope.container.scope.references)[scope.reference]) === null || _b === void 0 ? void 0 : _b.call(_a, scope.container.scope.mediator, scope.property, scope.value, scope.acceptor);
    }
    getDependency(scope, dependency) {
        var _a;
        if (dependency === undefined) {
            dependency = scope.dependency || this.getDependencyByReference(scope);
            if (dependency && typeof dependency === 'object' && dependency.constructor === Object)
                return this.watchDependency(scope, dependency);
        }
        return ((_a = dependency === null || dependency === void 0 ? void 0 : dependency.prototype) === null || _a === void 0 ? void 0 : _a.constructor) ? DIContainer.resolve(dependency, scope) : null;
    }
    static resolve(dependency, scope) {
        return scope.interceptor ? scope.interceptor.getDependency(scope.acceptor, scope.property, dependency) : dependency;
    }
    watchDependency(scope, dependency) {
        return new observer_1.Observer(dependency, {
            get: (property, descriptor) => {
                return this.getDependency(scope, descriptor.value || null);
            },
        }).get;
    }
    static container(target, property, injection) {
        var _a;
        var _b, _c;
        const container = target[_b = DIContainer.id] || (target[_b] = {
            props: {},
            intercept: (property) => { var _a; return (_a = container.props[property]) === null || _a === void 0 ? void 0 : _a.value; }
        });
        if (property) {
            (_c = container.props)[property] || (_c[property] = {});
            const { reference, value, dependency } = injection || {};
            container.props[property].value = value;
            reference && (container.props[property].reference = reference);
            dependency && (container.props[property].dependency = dependency);
            ((_a = value === null || value === void 0 ? void 0 : value.prototype) === null || _a === void 0 ? void 0 : _a.constructor) && (container.props[property].dependency = value);
        }
        return container;
    }
    intercept(acceptor, interceptor, interceptors) {
        if (!DIContainer.injectable(acceptor))
            return;
        const container = DIContainer.container(acceptor);
        container.intercept = (property, reference, dependency) => {
            var _a;
            (_a = container.props)[property] || (_a[property] = {});
            return this.getDependency({
                container: this,
                acceptor,
                reference: reference || container.props[property].reference,
                dependency: container.props[property].dependency || dependency,
                value: container.props[property].value,
                interceptor: (interceptors === null || interceptors === void 0 ? void 0 : interceptors[property]) || interceptor,
                property,
            });
        };
    }
    use(acceptor, interceptor) {
        this.intercepted(acceptor) || this.intercept(acceptor, interceptor);
    }
    inject(target, property, reference, dependency) {
        DIContainer.defineProperty(target, property, reference, dependency);
    }
    intercepted(target) {
        var _a;
        return ((_a = target[DIContainer.id]) === null || _a === void 0 ? void 0 : _a.intercept) !== undefined;
    }
    static injectable(target) {
        return !!(target && typeof target === 'object');
    }
    static defineProperty(target, property, reference, dependency) {
        DIContainer.injectable(target) && Object.defineProperty(target, property, {
            get: function () {
                return DIContainer.container(this).intercept(property, reference, dependency);
            },
            set: function (value) {
                return DIContainer.container(this, property, { reference, dependency, value }).props[property].value;
            },
            configurable: true,
            enumerable: true
        });
    }
}
DIContainer.id = CONTAINER_ID;
exports.DIContainer = DIContainer;
function injects(reference, dependency) {
    return function (target, property) {
        DIContainer.defineProperty(target, property, reference, dependency);
    };
}
exports.injects = injects;
//# sourceMappingURL=di.js.map