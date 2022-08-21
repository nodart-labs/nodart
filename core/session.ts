import {typeAppSessionConfig} from "./app_config";
import {Http2ServerRequest, Http2ServerResponse} from "http2";

export const DEFAULT_SESSION_NAME = 'session'

export class Session {

    protected _client

    protected _session

    protected _sessionName

    constructor(protected _config: typeAppSessionConfig) {
        this._client = require("client-sessions")(_config)
        this._sessionName = _config.cookieName || DEFAULT_SESSION_NAME
    }

    load(req: Http2ServerRequest, res: Http2ServerResponse) {
        this._client(req, res, () => {
            this._session = req[this._sessionName]
        })
        return this
    }

    get get() {
        return this._session ?? {}
    }

    set(key: string, value: any) {
        this.get[key] = value
    }

}
