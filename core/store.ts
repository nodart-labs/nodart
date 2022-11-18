import {fs, object} from '../utils'
import {
    StoreState,
    StoreListeners,
    StoreListenerArguments,
    StoreStateObject,
    StoreListenerObject,
    StoreObject
} from "./interfaces/store";
import {RuntimeException} from "./exception";

export class Store {

    private static stores: StoreObject = {}

    static add(store: string, storeDir: string): void {
        if (!fs.isDir(storeDir))
            throw new RuntimeException(`Store: The store repository "${storeDir}" does not exist.`)
        if (Store.stores[store])
            console.info(`Store: The store name "${store}" already has been registered in store.`)
        Store.stores[store] ||= new State(storeDir)
    }

    static get(store: string): State | undefined {
        return Store.stores[store]
    }
}

export class State {

    protected _states: object = {}

    constructor(readonly repo: string) {
    }

    protected getStore(storeName: string): StoreStateObject | void {

        if (this._states[storeName]) return this._states[storeName]

        const storeObject = fs.include(fs.join(this.repo, storeName))
        const store = storeObject && typeof storeObject === 'object' ? object.copy(storeObject) : {}

        store.states ||= {}
        store.events ||= {}
        store.listeners ||= []

        return this._states[storeName] = store
    }

    protected setState(storeName: string, state: StoreState): void | boolean {
        const store = this.getStore(storeName)
        if (!store || !this.checkState(store, state)) return false
        Object.assign(store.states, state)
    }

    checkState(store: StoreStateObject, state: StoreState, debug = true): boolean {
        if (!store?.states) return false
        return !Object.keys(state).some(prop => {
            if (store.states.hasOwnProperty(prop) === false) {
                debug && console.error(`The state property "${prop}" is not defined in store.`)
                return true
            }
        })
    }

    on(storeName: string, listeners: StoreListeners): void {

        const store = this.getStore(storeName)
        const {event, state} = listeners

        if (!store || (!event && !state)) return

        const types = {states: 'state', events: 'event'}
        const setAction = (src, type) => {

            src && Object.entries(src).forEach(<StoreListeners>([name, action]) => {

                if (!(name in store[type])) {
                    return console.error(`The ${types[type]}'s property "${name}" is not defined in "${storeName}" store.`)
                }

                store.listeners.push(<StoreListenerObject>{
                    [types[type]]: name,
                    action,
                    result: undefined
                })
            })
        }

        setAction(event, 'events')
        setAction(state, 'states')
    }

    get(storeName: string): any {
        const store = this.getStore(storeName)
        return store && store.states ? {...store.states} : {}
    }

    setup(storeName: string, state: StoreState): void {
        this.setState(storeName, state)
    }

    async set(storeName: string, listenerData: StoreListenerArguments) {
        const {state, event} = listenerData
        if (state && this.setState(storeName, state) === false) return
        await this.listen(storeName, {event, state})
    }

    async listen(storeName: string, stateData: StoreListenerArguments) {

        const store = this.getStore(storeName)
        const {state, event} = stateData

        if (!store || (!event && !state)) return

        const eventEntries = event ? Object.entries(event) : null
        const stateEntries = state ? Object.entries(state) : null

        const execute = async (listener, entries, type) => {
            for (let [name, args] of entries) {
                listener[type] === name && (listener.result = await listener.action.apply(listener, args))
            }
        }

        for (let listener of store.listeners) {
            stateEntries && await execute(listener, stateEntries, 'state')
            eventEntries && await execute(listener, eventEntries, 'event')
        }
    }

    reset(storeName: string): void {
        this._states[storeName] &&= null
    }

    remove(storeName: string, listeners: StoreListeners): void {

        const store = this.getStore(storeName)

        if (!store) return

        const {state, event} = listeners
        const eventListeners = {}
        const stateListeners = {}

        event && Object.keys(event).forEach(e => eventListeners[e] = event[e].toString())
        state && Object.keys(state).forEach(s => stateListeners[s] = state[s].toString())

        const events = Object.keys(eventListeners)
        const states = Object.keys(stateListeners)

        const match = (listener) => {
            const action = listener.action.toString()
            return listener.event
                ? events.some(e => listener.event === e && action === eventListeners[e])
                : states.some(s => listener.state === s && action === stateListeners[s])
        }

        store.listeners.forEach((listener, index) => match(listener) && store.listeners.splice(index, 1))
    }

}
