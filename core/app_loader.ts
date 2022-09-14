import {$, fs} from '../utils'
import {App} from './app'
import {DependencyInterceptorInterface} from "../interfaces/di";
import {Service} from "./service";
import {ServiceScope} from "../interfaces/service";
import {AppLoaders} from "../interfaces/app";

export abstract class AppLoader implements DependencyInterceptorInterface {

    protected _repository: string = ''

    protected _pathSuffix: string = ''

    protected _target: any

    protected _targetPath: string = ''

    protected _serviceScope: ServiceScope = {}

    get serviceScope() {

        return {...this._serviceScope, ...{app: this._app}}
    }

    set serviceScope(scope: ServiceScope) {

        Object.assign(this._serviceScope, scope)
    }

    protected constructor(protected _app: App) {
    }

    protected abstract _onCall(target: any, args?: any[]): void

    protected abstract _onGenerate(repository: string): void

    protected _resolve(target?: any, args?: any[]): any {

        if (target?.prototype?.constructor) return Reflect.construct(target, args ?? [])

        return target
    }

    get repository() {

        return $.trimPath(this._repository)
    }

    getTarget(): any {

        return this._target
    }

    onGetDependency(target: any): void {

        target instanceof Service && target.setScope(this.serviceScope)
    }

    onGetProperty(property: string, value: any, reference?: string): any {
    }

    getUnderScorePath(targetPath?: string) {

        targetPath ||= this._targetPath

        return targetPath.replace('/', '_')
    }

    getReferenceTarget(referencePathLike: string, targetPath?: string): string | void {

        targetPath ||= this._targetPath

        if (!targetPath || !referencePathLike) return

        const path = this.getUnderScorePath(targetPath)

        if (this.isTarget(referencePathLike + '/' + path)) return path

        if (this.isTarget(referencePathLike + '/' + this._targetPath)) return targetPath
    }

    getReferenceProps(reference:string): any[] | void {
    }

    intercept() {

        this._app.di.interceptor(this).intercept()
    }

    require(path: string, targetObjectType?: any) {

        this._target = undefined

        this.isSource(path) && (this._target = fs.getSource(this.absPath(path), targetObjectType || this.targetType))

        return this
    }

    protected get targetType() {

        return undefined
    }

    call(args: any[] = []) {

        this._onCall(this._target, args)

        this.intercept()

        return this._resolve(this._target, args)
    }

    async generate() {

        await this._onGenerate(this.getRepo())
    }

    getRepo(): string {

        const repo = this.repository

        if (!repo) return ''

        const path = require('path').resolve(this._app.rootDir, repo)

        fs.isDir(path) || fs.mkDeepDir(path)

        return path
    }

    absPath(path: string): string {

        const repo = this.getRepo()

        path = this.securePath(path)

        return repo ? require('path').resolve(repo, $.trimPath(path) + this._pathSuffix) : ''
    }

    isTarget(path: string) {

        return fs.isFile(require('path').resolve(this._app.rootDir, $.trimPath(path)), ['ts', 'js'])
    }

    isSource(path: string) {

        return fs.isFile(this.absPath(path), ['ts', 'js'])
    }

    isFile(path: string) {

        return fs.isFile(this.absPath(path))
    }

    securePath(path: string) {

        return path.replace('../', '').replace('..\\', '')
    }

    intersectLoader(loaderName: AppLoaders, subRepo?: string, targetPath?: string) {

        subRepo ||= ''

        targetPath ||= this._targetPath

        const loader = this._app.get(loaderName)

        if (!loader) return

        const referenceTarget = loader.getReferenceTarget(
            loader.repository + (subRepo ? '/' + $.trimPath(subRepo) : ''),
            $.trimPath(targetPath)
        )

        if (referenceTarget) return loader.require(subRepo + '/' + referenceTarget)
    }

}
