import {fs, object} from '../utils'

export type typeState = { [name: string]: any }

export type typeStoreListeners = {
    event?: { [name: string]: (...args: any) => Promise<any> | any },
    state?: { [name: string]: (...args: any) => Promise<any> | any },
}

export type typeStoreListenerArguments = {
    event?: { [name: string]: any[] },
    state?: { [name: string]: any },
}

type typeStoreListenerObject = {
    event?: string,
    state?: string,
    action: (...args: any) => Promise<any> | any,
    result: any,
}

type typeStateObject = {
    events?: object,
    states?: object,
    listeners?: typeStoreListenerObject[]
}

type typeStoreObject = {
    [name: string]: AppListener
}

export class AppStore {

    private static stores: typeStoreObject = {}

    static add(store: string, storeDir: string): void {
        if (!fs.isDir(storeDir)) throw `The store repository "${storeDir}" does not exist.`
        if (AppStore.stores[store]) console.info(`The store name "${store}" already has been registered in store.`)
        AppStore.stores[store] ||= new AppListener(storeDir)
    }

    static get(store: string): AppListener | undefined {
        return AppStore.stores[store]
    }

}

export class AppListener {

    protected _states: object = {}

    constructor(readonly repo: string) {
    }

    protected getStore(storeName: string): typeStateObject | void {
        try {
            if (this._states[storeName]) return this._states[storeName]

            const storeObject = require(this.repo + '/' + storeName)
            const store = storeObject instanceof Object ? object.copy(storeObject) : {}

            store.states ||= {}
            store.events ||= {}
            store.listeners ||= []

            return this._states[storeName] = store

        } catch (e) {
            console.error(e)
        }
    }

    protected setState(storeName: string, state: typeState): void | boolean {
        const store = this.getStore(storeName)
        if (!store || !this.checkState(store, state)) return false
        Object.assign(store.states, state)
    }

    checkState(store: typeStateObject, state: typeState, debug = true): boolean {
        if (!store?.states) return false
        return !Object.keys(state).some(prop => {
            if (store.states.hasOwnProperty(prop) === false) {
                debug && console.error(`The state property "${prop}" is not defined in store.`)
                return true
            }
        })
    }

    on(storeName: string, listeners: typeStoreListeners): void {

        const store = this.getStore(storeName)
        const {event, state} = listeners

        if (!store || (!event && !state)) return

        const types = {states: 'state', events: 'event'}
        const setAction = (src, type) => {

            src && Object.entries(src).forEach(<typeStoreListeners>([name, action]) => {

                if (!(name in store[type])) {
                    return console.error(`The ${types[type]}'s property "${name}" is not defined in "${storeName}" store.`)
                }

                store.listeners.push(<typeStoreListenerObject>{
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

    setup(storeName: string, state: typeState): void {
        this.setState(storeName, state)
    }

    async set(storeName: string, listenerData: typeStoreListenerArguments) {
        const {state, event} = listenerData
        if (state && this.setState(storeName, state) === false) return
        await this.listen(storeName, {event, state})
    }

    async listen(storeName: string, stateData: typeStoreListenerArguments) {

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

    remove(storeName: string, listeners: typeStoreListeners): void {

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
