import { AppLoader } from "../core/app_loader";
import { App, AppBuilder } from "../core/app";

export class AppBuilderLoader extends AppLoader {
  onGenerate() {}

  call(args: [app?: App]): any {
    return new AppBuilder(args?.[0] ?? this.app);
  }
}
