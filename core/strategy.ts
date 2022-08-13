export abstract class Strategy {

    protected _data: any

    abstract resolve(): Promise<any>
}
