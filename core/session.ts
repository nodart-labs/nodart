import {SessionConfigInterface} from "../interfaces/session";
import {BaseHttpResponseInterface} from "../interfaces/http";

export const DEFAULT_SESSION_NAME = 'session'

export class Session {

    readonly client = require("client-sessions")

    protected _session

    protected _sessionName

    constructor(readonly config: SessionConfigInterface) {

        this.client = this.client(config)

        this._sessionName = config.cookieName || DEFAULT_SESSION_NAME
    }

    load(http: BaseHttpResponseInterface) {

        this.client(http.request, http.response, () => this._session = http.request[this._sessionName])

        return this
    }

    get get() {

        return this._session ?? {}
    }

    set(data: {[key: string]: any}) {

        Object.assign(this.get, data)
    }

}
