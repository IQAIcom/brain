import type { Handler, HandlerCallback, IAgentRuntime, Memory, Plugin, State } from "@elizaos/core";

export interface SimplePluginOptions {
  name: string;
  description: string;
  handler: SimpleHandler;
}

type SimpleHandler = (options: HandlerOptions) => Promise<unknown>;

export interface HandlerOptions {
  runtime: IAgentRuntime;
  message: Memory;
  state: State;
  options: {
    [key: string]: unknown;
  };
  callback?: HandlerCallback;
}

export const createSimplePlugin = (options: SimplePluginOptions): Plugin => {
  const handlerWrapper: Handler = (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    handlerOptions?: { [key: string]: unknown },
    callback?: HandlerCallback
  ) => {
    return options.handler({
      runtime,
      message,
      state: state ,
      options: handlerOptions,
      callback
    });
  };

  return {
    name: options.name,
    description: options.description,
    actions: [
      {
        name: `EXECUTE_${options.name}`,
        description: options.description,
        handler: handlerWrapper,
        similes: [],
        examples: [],
        validate: async () => true
      }
    ]
  };
};
