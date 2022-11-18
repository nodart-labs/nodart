import {App} from '../core/app'
import {HttpClient} from "../core/http_client";
import {BaseHttpResponseInterface} from "../core/interfaces/http";
import {AppEventHttpResponseInterface} from "../core/interfaces/app";

export = <AppEventHttpResponseInterface>(async (app: App, http: BaseHttpResponseInterface) => {

    if (HttpClient.getResponseIsSent(http.response)) return

    const response = http.responseData

    const content = HttpClient.getHttpResponseDataContent(response)

    http.response.writeHead(response.status, {'Content-Type': response.contentType})

    http.response.end(content)

})
