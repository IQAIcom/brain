import type { ActionExample, Handler, HandlerCallback, IAgentRuntime, Memory, Plugin, State, Validator } from "@elizaos/core";

export interface SimplePluginOptions {
  name: string;
  description: string;
  actions: SimpleAction[];
}

export interface SimpleAction {
  name: string;
  description?: string;
  similes?: string[];
  examples?: ActionExample[][];
  validate?: Validator;
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
  const createHandlerWrapper = (handler: SimpleHandler): Handler => {
    return (
      runtime: IAgentRuntime,
      message: Memory,
      state?: State,
      handlerOptions?: { [key: string]: unknown },
      callback?: HandlerCallback
    ) => {
      return handler({
        runtime,
        message,
        state: state,
        options: handlerOptions,
        callback
      });
    };
  };

  return {
    name: options.name,
    description: options.description,
    actions: options.actions.map(action => ({
      name: action.name,
      description: action.description || '',
      handler: createHandlerWrapper(action.handler),
      similes: action.similes || [],
      examples: action.examples || [],
      validate: action.validate || (async () => true)
    }))
  };
};
