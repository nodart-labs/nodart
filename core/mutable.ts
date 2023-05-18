import {
  MutableInterface,
  ResolveDataMutable,
  ResolveDataMutableList,
} from "./interfaces/mutable";

export class Mutable<T extends MutableInterface> {
  private declare _mutable;
  private declare _mutableList;

  constructor(readonly entity: T) {}

  get get(): ResolveDataMutable<T> {
    if (!this._mutable) {
      this._mutable = {};

      Object.keys(this.entity.mutable).forEach((key) => {
        this._mutable[key] = (...args) => {
          if (!args[0]) return;

          return this._resolve(this.entity.mutable[key], args);
        };
      });
    }

    return this._mutable;
  }

  get list(): ResolveDataMutableList<T> {
    if (!this._mutableList) {
      this._mutableList = {};

      Object.keys(this.entity.mutable).forEach((key) => {
        this._mutableList[key] = (...args) => {
          if (!args[0]) return;

          const target = args[0];

          args.shift();

          for (let i = 0; i < target.length; i++) {
            this._resolve(this.entity.mutable[key], [target[i], ...args]);
          }

          return target;
        };
      });
    }

    return this._mutableList;
  }

  private _resolve(get: (...args) => any, args: any[]) {
    const [target, exclude] = get.apply(this.entity, args);
    const output = { ...args[0] };

    Object.assign(output, target);

    if (exclude)
      for (let i = 0; i < exclude.length; i++) {
        delete output[exclude[i]];
      }

    return output;
  }
}
