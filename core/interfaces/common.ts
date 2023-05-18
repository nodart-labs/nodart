export type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => void
  ? P
  : never;
