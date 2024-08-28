export type KeypressHandler<HandlerArgs extends Array<unknown>> = {
  keys: Array<string>;
  handler: (...args: HandlerArgs) => void;
  passThrough: boolean;
};
