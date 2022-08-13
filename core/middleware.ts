export type typeMiddlewareCase = {
    uses: typeMiddlewareUseCase[],
    rule: string,
    descriptor: string | object,
    payload: typeMiddlewareCasePayload
}

export type typeMiddlewareCasePayload = (...args: any) => any

export type typeMiddlewareUseCase = {
    reference: string,
    props: any[]
}

export declare type typeMiddlewareFilterCase = (middlewareCase: typeMiddlewareCase) => typeMiddlewareCase | void

export abstract class Middleware {

    readonly cases: typeMiddlewareCase[] = []

    protected _uses: any[] = []

    constructor(readonly scope: object = {}) {
    }

    setScope(scope: object) {
        Object.assign(this.scope, scope)
    }

    abstract expose(rule: string, filter?: typeMiddlewareFilterCase): typeMiddlewareCase | void

    use(reference: string, props: any[] = []): Middleware {
        this._uses.push({reference, props})
        return this
    }

    on(rule: string, descriptor?: string | object, payload?: typeMiddlewareCasePayload): void {
        this.cases.push({
            uses: this._uses,
            rule,
            descriptor,
            payload,
        })
        this._uses = []
    }
}
