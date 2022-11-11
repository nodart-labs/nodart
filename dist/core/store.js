"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = exports.Store = void 0;
const utils_1 = require("../utils");
const exception_1 = require("./exception");
class Store {
    static add(store, storeDir) {
        var _a;
        if (!utils_1.fs.isDir(storeDir))
            throw new exception_1.RuntimeException(`Store: The store repository "${storeDir}" does not exist.`);
        if (Store.stores[store])
            console.info(`Store: The store name "${store}" already has been registered in store.`);
        (_a = Store.stores)[store] || (_a[store] = new State(storeDir));
    }
    static get(store) {
        return Store.stores[store];
    }
}
exports.Store = Store;
Store.stores = {};
class State {
    constructor(repo) {
        this.repo = repo;
        this._states = {};
    }
    getStore(storeName) {
        if (this._states[storeName])
            return this._states[storeName];
        const storeObject = utils_1.fs.include(utils_1.fs.join(this.repo, storeName));
        const store = storeObject instanceof Object ? utils_1.object.copy(storeObject) : {};
        store.states || (store.states = {});
        store.events || (store.events = {});
        store.listeners || (store.listeners = []);
        return this._states[storeName] = store;
    }
    setState(storeName, state) {
        const store = this.getStore(storeName);
        if (!store || !this.checkState(store, state))
            return false;
        Object.assign(store.states, state);
    }
    checkState(store, state, debug = true) {
        if (!(store === null || store === void 0 ? void 0 : store.states))
            return false;
        return !Object.keys(state).some(prop => {
            if (store.states.hasOwnProperty(prop) === false) {
                debug && console.error(`The state property "${prop}" is not defined in store.`);
                return true;
            }
        });
    }
    on(storeName, listeners) {
        const store = this.getStore(storeName);
        const { event, state } = listeners;
        if (!store || (!event && !state))
            return;
        const types = { states: 'state', events: 'event' };
        const setAction = (src, type) => {
            src && Object.entries(src).forEach(([name, action]) => {
                if (!(name in store[type])) {
                    return console.error(`The ${types[type]}'s property "${name}" is not defined in "${storeName}" store.`);
                }
                store.listeners.push({
                    [types[type]]: name,
                    action,
                    result: undefined
                });
            });
        };
        setAction(event, 'events');
        setAction(state, 'states');
    }
    get(storeName) {
        const store = this.getStore(storeName);
        return store && store.states ? Object.assign({}, store.states) : {};
    }
    setup(storeName, state) {
        this.setState(storeName, state);
    }
    set(storeName, listenerData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { state, event } = listenerData;
            if (state && this.setState(storeName, state) === false)
                return;
            yield this.listen(storeName, { event, state });
        });
    }
    listen(storeName, stateData) {
        return __awaiter(this, void 0, void 0, function* () {
            const store = this.getStore(storeName);
            const { state, event } = stateData;
            if (!store || (!event && !state))
                return;
            const eventEntries = event ? Object.entries(event) : null;
            const stateEntries = state ? Object.entries(state) : null;
            const execute = (listener, entries, type) => __awaiter(this, void 0, void 0, function* () {
                for (let [name, args] of entries) {
                    listener[type] === name && (listener.result = yield listener.action.apply(listener, args));
                }
            });
            for (let listener of store.listeners) {
                stateEntries && (yield execute(listener, stateEntries, 'state'));
                eventEntries && (yield execute(listener, eventEntries, 'event'));
            }
        });
    }
    reset(storeName) {
        var _a;
        (_a = this._states)[storeName] && (_a[storeName] = null);
    }
    remove(storeName, listeners) {
        const store = this.getStore(storeName);
        if (!store)
            return;
        const { state, event } = listeners;
        const eventListeners = {};
        const stateListeners = {};
        event && Object.keys(event).forEach(e => eventListeners[e] = event[e].toString());
        state && Object.keys(state).forEach(s => stateListeners[s] = state[s].toString());
        const events = Object.keys(eventListeners);
        const states = Object.keys(stateListeners);
        const match = (listener) => {
            const action = listener.action.toString();
            return listener.event
                ? events.some(e => listener.event === e && action === eventListeners[e])
                : states.some(s => listener.state === s && action === stateListeners[s]);
        };
        store.listeners.forEach((listener, index) => match(listener) && store.listeners.splice(index, 1));
    }
}
exports.State = State;
//# sourceMappingURL=store.js.map