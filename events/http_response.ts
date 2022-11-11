import {App} from '../core/app'
import {HttpClient} from "../core/http_client";
import {HttpContainerInterface} from "../core/interfaces/http";

export = async (app: App, http: HttpContainerInterface) => {

    if (http.responseIsSent) return

    const response = http.responseData

    const content = HttpClient.getHttpResponseDataContent(response)

    http.response.writeHead(response.status, {'Content-Type': response.contentType})

    http.response.end(content)

}
