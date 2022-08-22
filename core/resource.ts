import {Http2ServerResponse} from "http2";
import {$} from "../utils";
import {DEFAULT_MIME_TYPE, DEFAULT_MIME_TYPES} from "./app_config";

const fs = require('fs')
const path = require('path')

export class Resource {

    constructor(readonly response: Http2ServerResponse) {
    }

    send(data: object | string, status: number = 200, contentType: string = 'application/json') {
        this.response.writeHead(status, {'Content-Type': contentType})
        data ? this.response.end($.isPlainObject(data) ? JSON.stringify(data) : data.toString(), 'utf-8')
            : this.response.end()
    }

    sendHtml(content: string) {
        this.response.writeHead(200, {'Content-Type': 'text/html'})
        this.response.end(content, 'utf-8')
    }

    sendFile(filePath: string, mimeTypes?: object, defaultMimeType?: string) {

        const ext = $.trim(path.extname(filePath), '.')

        mimeTypes = Object.assign({...DEFAULT_MIME_TYPES}, mimeTypes ?? {})

        const contentType = mimeTypes[ext] || defaultMimeType || DEFAULT_MIME_TYPE

        fs.readFile(filePath, (err, content) => {
            // todo: exception handler
            if (err) {
                this.response.writeHead(500)
                this.response.end()
            } else {
                this.response.writeHead(200, {'Content-Type': contentType})
                this.response.end(content, 'utf-8')
            }
        })
    }

}
