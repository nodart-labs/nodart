import { App } from "../core/app";
import { $, fs, object } from "../utils";
import { DEFAULT_CMD_DIR } from "../core/app_config";
import { FSCashier } from "../utils/fs_cashier";
import { Model } from "../core/model";
import { Service } from "../core/service";

export class CashierService {
  readonly fs: FSCashier;

  private model = {};

  private service = {};

  constructor(readonly app: App) {
    const staticLoader = app.get("static");
    const engineLoader = app.get("engine");
    const storeLoader = app.get("store");
    const ormLoader = app.get("orm");

    const excludeFolders = [
      fs.join(app.rootDir, "node_modules"),
      fs.join(app.rootDir, DEFAULT_CMD_DIR),
      staticLoader.getRepo(),
      engineLoader.getRepo(),
      storeLoader.getRepo(),
      ormLoader.getRepo(),
      app.builder.buildDir,
    ];

    this.fs = new FSCashier({ excludeFolders, extensions: ["ts", "js"] });
  }

  cacheAppFolder() {
    this.fs.cacheFolder(this.app.rootDir);

    this._fetchSources("model");

    this._fetchSources("service");
  }

  watchAppFolder() {
    this.fs.watchFolder(this.app.rootDir);
  }

  getFile(path: string) {
    return this.fs.getFile(path);
  }

  isFile(path: string) {
    return FSCashier.isFile(path);
  }

  protected _fetchSources(name: "model" | "service") {
    this[name] = {};

    const loader = this.app.get(name);
    const repo = loader.getRepo();
    const types = {
      model: Model,
      service: Service,
    };

    fs.dir(repo, ({ file }) => {
      if (!file) return;

      const path = fs.skipExtension(
        $.trimPath(fs.formatPath(file.replace(repo, ""))),
      );
      const source = loader.load(path, types[name]);

      source && object.set(this[name], path.replace(/\//g, "."), source);
    });

    this[name] = Object.freeze(this[name]);
  }

  get(name: "model" | "service") {
    return { ...this[name] };
  }
}
