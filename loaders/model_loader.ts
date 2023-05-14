import { AppLoader } from "../core/app_loader";
import { Model } from "../core/model";
import { App } from "../core/app";

export class ModelLoader extends AppLoader {
  protected _repository = "models";

  get sourceType() {
    return Model;
  }

  call(
    args?: [type: typeof Model, app?: App],
    path?: string,
    rootDir?: string,
  ) {
    let [type, app] = args || [];

    type ||= this._source;
    app ||= this.app;

    const model = this.resolve(
      path ? this.load(path, Model, rootDir) : type,
      args,
    );

    if (model) {
      model.orm ||= app.service.db.orm;
      model.queryBuilder ||= model.orm.queryBuilder;
    }

    return model;
  }

  onGenerate() {}
}
