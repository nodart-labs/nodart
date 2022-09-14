import {RouteEntry} from "../../../interfaces/router";

export = <RouteEntry>{
    index: [
        {
            name: 'index',
            path: '/',
        }
    ],
    sample: 'sample',
    sample2: [
        '/:foo?/:+id'
    ]
}
