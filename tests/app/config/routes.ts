import {RouteEntry} from "../../../core/interfaces/router";

export = <RouteEntry>{
    index: [
        {
            name: 'index',
            path: '/',
        }
    ],
    sample: 'sample',
    sample2: [
        {
            path: '/:foo/:+id?',
            // action: 'post'
        },

        // '/:foo/:test/:fgh',
    ]
}
