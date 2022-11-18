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
        var _a, _b, _c;
        if (dependency === undefined) {
            if ((_b = (_a = scope.value) === null || _a === void 0 ? void 0 : _a.prototype) === null || _b === void 0 ? void 0 : _b.constructor)
                return DIContainer.resolve(dependency, scope);
            dependency = this.getDependencyByReference(scope);
            if (dependency && typeof dependency === 'object' && dependency.constructor === Object)
                return this.watchDependency(scope, dependency);
        }
        return ((_c = dependency === null || dependency === void 0 ? void 0 : dependency.prototype) === null || _c === void 0 ? void 0 : _c.constructor) ? DIContainer.resolve(dependency, scope) : null;
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
    static container(target, property, reference) {
        var _a, _b;
        const container = target[_a = DIContainer.id] || (target[_a] = {
            props: {},
            intercept: (property) => { var _a; return (_a = container.props[property]) === null || _a === void 0 ? void 0 : _a.value; }
        });
        if (property) {
            (_b = container.props)[property] || (_b[property] = {});
            reference && (container.props[property].reference = reference);
        }
        return container;
    }
    intercept(acceptor, interceptor, interceptors) {
        if (!DIContainer.injectable(acceptor))
            return;
        const container = DIContainer.container(acceptor);
        container.intercept = (property, reference) => {
            var _a;
            (_a = container.props)[property] || (_a[property] = {});
            return this.getDependency({
                container: this,
                acceptor,
                reference,
                value: container.props[property].value,
                interceptor: (interceptors === null || interceptors === void 0 ? void 0 : interceptors[property]) || interceptor,
                property,
            });
        };
    }
    inject(target, property, reference) {
        DIContainer.defineProperty(target, property, reference);
    }
    intercepted(target) {
        var _a;
        return DIContainer.injectable(target) && ((_a = target[DIContainer.id]) === null || _a === void 0 ? void 0 : _a.intercept) !== undefined;
    }
    static injectable(target) {
        var _a;
        return !!(target && typeof target === 'object' && !((_a = target.prototype) === null || _a === void 0 ? void 0 : _a.constructor));
    }
    static defineProperty(target, property, reference) {
        DIContainer.injectable(target) && Object.defineProperty(target, property, {
            get: function () {
                return DIContainer.container(this).intercept(property, reference);
            },
            set: function (value) {
                return DIContainer.container(this, property, reference).props[property].value = value;
            },
            configurable: true,
            enumerable: true
        });
    }
}
exports.DIContainer = DIContainer;
DIContainer.id = CONTAINER_ID;
function injects(reference) {
    return function (target, property) {
        DIContainer.defineProperty(target, property, reference);
    };
}
exports.injects = injects;
//# sourceMappingURL=di.js.map