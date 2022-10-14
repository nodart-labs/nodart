import {App} from "../../core/app"
import {SampleService} from "./services/sample";
import {Sample2Controller} from "./controllers/sample2_controller";

const config = require('./config')

/*const {app, http, server} = new App({...config}).start(3000)

http.get('/sample-http-service/:+id?', ({
    app,
    http,
    session,
    route,
    model,
    service,
    respond,
    controller
}) => {

    const sampleService = service.sample as SampleService

    const scope = {}

    Object.entries(sampleService.scope).forEach(([entry, data]) => scope[entry] = data?.constructor ?? data)

    console.log('SampleService scope:', scope)

    console.log('----------------------------')

    console.log('current request headers:', http.request.headers)

    console.log('----------------------------')

    console.log('current route data:', route)

    console.log('----------------------------')

    console.log('current URL data:', http.parseURL)

    respond.send.view('index', {
        title: 'Sample Http Service',
        code:
            '\r\n'
            + 'http.get("/sample-http-service/:+id?", (scope) => {'
            + '\r\n'
            + '\r\n'
            + '...'
            + '\r\n'
            + '\r\n'
            + '})'
    })

})

http.get('/form-data', ({respond}) => {

    respond.send.view('form')

})

//

http.post('/form-data', async ({http}) => {

    const data = http.isFormData
        ? await http.form.fetchFormData().then(form => {
            const {fields, files} = form
            return {fields, files}
        })
        : await http.data

    console.log(data)

    if (http.isFormData) return {fields: data.fields, files: data.files}

    return data

})*/

new App({...config}).init().then(app => {

    app.serve(3000, 'http', '127.0.0.1')

    /*******************************************************************************************
     HTTP SERVICE (since version: 3.2.0):

     When handling a http request, the http service offers the possibility
     to develop straightforward callback functions that exclude the usual controller method call.

     EXAMPLE:
     ********************************************************************************************/

    const http = app.service.http()

    /**
     * @param route string | RouteDescriptor <{
     *     path: string,
     *     name?: string,
     *     action?: string,
     *     controller?: (route: RouteData) => typeof Controller,
     *     types?: {
     *         [paramName: string]: typeof Number | RegExp | ((value: any) => any)
     *     },
     *     [addon: string]: any
     * }>
     *
     * @param callback (scope: HttpServiceScope) => Promise<void> | void
     */

    http.get('/sample-http-service/:+id?', ({
        app,
        http,
        session,
        route,
        model,
        service,
        respond,
        controller
    }) => {

        const sampleService = service.sample as SampleService

        const scope = {}

        Object.entries(sampleService.scope).forEach(([entry, data]) => scope[entry] = data?.constructor ?? data)

        console.log('SampleService scope:', scope)

        console.log('----------------------------')

        console.log('current request headers:', http.request.headers)

        console.log('----------------------------')

        console.log('current route data:', route)

        console.log('----------------------------')

        console.log('current URL data:', http.parseURL)

        respond.send.view('index', {
            title: 'Sample Http Service',
            code:
                '\r\n'
                + 'http.get("/sample-http-service/:+id?", (scope) => {'
                + '\r\n'
                + '\r\n'
                + '...'
                + '\r\n'
                + '\r\n'
                + '})'
        })

    })

    http.get('/form-data', ({respond}) => {

        respond.send.view('form')

    })

    //

    http.post('/form-data', async ({http}) => {

        const data = http.isFormData
            ? await http.form.fetchFormData().then(form => {
                const {fields, files} = form
                return {fields, files}
            })
            : await http.data

        console.log(data)

        if (http.isFormData) return {fields: data.fields, files: data.files}

        return data

    })

})
