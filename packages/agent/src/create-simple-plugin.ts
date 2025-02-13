import type { ActionExample, Handler, HandlerCallback, IAgentRuntime, Memory, Plugin, State, Validator } from "@elizaos/core";
import { z } from "zod";

const SimpleActionSchema = z.object({
  name: z.string()
    .describe('Unique identifier for the action'),
  description: z.string()
    .optional()
    .describe('Human-readable explanation of what this action does'),
  similes: z.array(z.string())
    .optional()
    .describe('Alternative terms or synonyms that can trigger this action'),
  examples: z.array(z.array(z.custom<ActionExample>()))
    .optional()
    .describe('Sample usage patterns for this action'),
  validate: z.custom<Validator>()
    .optional()
    .describe('Custom validation function that returns Promise<boolean>'),
  handler: z.custom<SimpleHandler>()
    .describe('Function that implements the action logic')
});

const SimplePluginOptionsSchema = z.object({
  name: z.string()
    .describe('Unique identifier for the plugin'),
  description: z.string()
    .describe('Human-readable explanation of what this plugin does'),
  actions: z.array(SimpleActionSchema)
    .describe('Collection of actions this plugin provides')
});

export type SimplePluginOptions = z.infer<typeof SimplePluginOptionsSchema>;
export type SimpleAction = z.infer<typeof SimpleActionSchema>;

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
  // Validate the input options
  const validatedOptions = SimplePluginOptionsSchema.parse(options);

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
    name: validatedOptions.name,
    description: validatedOptions.description,
    actions: validatedOptions.actions.map(action => ({
      name: action.name,
      description: action.description || '',
      handler: createHandlerWrapper(action.handler),
      similes: action.similes || [],
      examples: action.examples || [],
      validate: action.validate || (async () => true)
    }))
  };
};
