export interface DataProviderInterface {
    get(): Object,
    list(): Array<any>,
    update(): Object,
    delete(): Boolean,
}
