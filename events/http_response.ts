import {App} from '../core/app'
import {BaseHttpResponseInterface} from "../interfaces/http";
import {HttpClient} from "../core/http_client";

export = async (app: App, http: BaseHttpResponseInterface) => {

    const response = http.responseData

    const content = HttpClient.getHttpResponseDataContent(response)

    http.response.writeHead(response.status, {'Content-Type': response.contentType})

    http.response.end(content)

}
