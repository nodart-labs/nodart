import {Http2ServerRequest, Http2ServerResponse} from "http2";

const _url = require('url')

type typeHttpData = {
    protocol: string,
    slashes: string,
    auth: string,
    host: string,
    port: string,
    hostname: string,
    hash: string,
    search: string,
    query: object,
    pathname: string,
    path: string,
    href: string
}

export class HttpClient {

    constructor (
        readonly request: Http2ServerRequest,
        readonly response?: Http2ServerResponse) {
    }

    get parseURL(): typeHttpData {
        return _url.parse(this.request.url, true)
    }

    static isValidURL(url: string) {
        try {
            new _url.URL(url)
            return true
        } catch (error) {
            return false
        }
    }

}
