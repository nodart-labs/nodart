export interface HttpAcceptorInterface {

    get(...args): any

    post(...args): any

    patch(...args): any

    put(...args): any

    delete(...args): any

    head(...args): any
}
