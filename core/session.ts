import {SessionClientConfigInterface} from "./interfaces/session";
import {HttpContainerInterface} from "./interfaces/http";

export const DEFAULT_SESSION_NAME = 'session'

export class Session {

    readonly client = require("client-sessions")

    protected _session

    protected _sessionName

    constructor(readonly config: SessionClientConfigInterface) {

        this.client = this.client(config)

        this._sessionName = config.cookieName || DEFAULT_SESSION_NAME
    }

    load(http: HttpContainerInterface) {

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
