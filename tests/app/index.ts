import {App} from "../../core/app"
import {SampleService} from "./services/sample";
import {Sample2Controller} from "./controllers/sample2_controller";
import {measure, fs} from "../../utils";
import {Service} from "../../core/service";
import {SampleController} from "./controllers/sample_controller";

const config = require('./config')


new App({...config}).init().then(async app => {

    const server = await app.serve(3000, 'http', '127.0.0.1')

    /*******************************************************************************************
     HTTP SERVICE (since version: 3.2.0):

     When handling a http request, the http service offers the possibility
     to develop straightforward callback functions that exclude the usual controller method call.

     EXAMPLE:
     ********************************************************************************************/

    const http = app.service.http

    /**
     * @param route string | RouteDescriptor <{
     *     path: string,
     *     name?: string,
     *     action?: string,
     *     controller?: (route: RouteData) => typeof BaseController,
     *     types?: {
     *         [paramName: string]: typeof Number | RegExp | ((value: any) => any)
     *     },
     *     [addon: string]: any
     * }>
     *
     * @param callback (scope: ServiceScope) => Promise<void> | void
     */

    /*http.get('/test/:param1/:param2/:param3/:param4', ({route}) => {
        const {param1, param2, param3, param4} = route.params
        return {param1, param2, param3, param4}
    })*/

    http.get('/', (scope) => {

        // scope.service().sample

        // console.log(scope.service().sample)
        // console.log(scope.model().sub.sample)

        // new SampleService(scope)

        return {ok: true}

    })

    http.get({path: '/sample-http-service/:+id?', controller: () => SampleController}, ({
        app,
        http,
        route,
        model,
        service,
        controller
    }) => {

        const sampleController = controller() as SampleController

        console.log('Sample Controller:', sampleController.constructor)

        const sampleService = service().sample as SampleService

        const scope = {}

        Object.entries(sampleService.scope).forEach(([entry, data]) => scope[entry] = data?.constructor ?? data)

        console.log('SampleService scope:', scope)

        console.log('----------------------------')

        console.log('current request headers:', http.request.headers)

        console.log('----------------------------')

        console.log('current route data:', route)

        console.log('----------------------------')

        console.log('current HOST data:', http.host)

        http.respond.view('index', {
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

    http.get('/form-data', ({http}) => {

        http.respond.view('form')

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

        if (http.isFormData) {

            return {fields: data.fields, files: data.files}
        }

        return data

    })
})
