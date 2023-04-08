export type ObserverDescriptor = {
  source: any;
  prop: string | number;
  path: string[];
  value?: any;
  old?: any;
};

export type ObserverGetter = (
  property: string | number,
  descriptor: ObserverDescriptor,
) => any;
export type ObserverSetter = (
  property: string | number,
  value: any,
  descriptor: ObserverDescriptor,
) => any;

export type ObserverHandlers = {
  set?: ObserverSetter;
  get?: ObserverGetter;
};
