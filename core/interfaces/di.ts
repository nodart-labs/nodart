import { DIContainer, DependencyInterceptor } from "../di";

export type DIReference = {
  [reference: string]: (
    mediator: any,
    property: string,
    value: any,
    acceptor: object,
  ) => any;
};

export type DIScope = {
  mediator?: any;
  references?: DIReference;

  [addon: string]: any;
};

export type DependencyScope = {
  acceptor: object;
  reference: string;
  dependency?: any;
  container: DIContainer;
  property: string;
  value: any;
  interceptor?: DependencyInterceptor;
};

export type InjectionContainer = {
  props: { [property: string]: InjectionProperty };
  intercept(property: string, reference?: string, dependency?: any): any;
};

export type InjectionProperty = {
  value: any;
  reference: string;
  dependency?: any;
};

export interface DependencyInterceptorInterface {
  getDependency(acceptor: any, property: string, dependency: any): any;
}
