import type { Action } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import type { ContractService } from "../services/contract.js";
import { InputParserService } from "../services/input-parser.js";
import dedent from "dedent";
import type { FunctionMetadata } from "../types.js";

const FUNCTION_ARGUMENT_TEMPLATE = `Respond with a JSON object containing the arguments for the function call.
Extract the arguments from all recent messages.

The response must include an array of arguments in the correct order for the function.

Example response:
\`\`\`json
{
    "args": [123, "0x123..."]
}
\`\`\`

{{recentMessages}}`;

export function generateActionsFromAbi(
	contractService: ContractService,
	contractName: string,
	functions: FunctionMetadata[],
): Action[] {
	const actions: Action[] = [];
	const inputParser = new InputParserService();

	for (const func of functions) {
		const actionName = `${contractName.toUpperCase()}_${func.name.toUpperCase()}`;

		const action: Action = {
			name: actionName,
			description: `${func.isReadFunction ? "Query" : "Execute"} the ${func.name} function on ${contractName} contract`,
			similes: [
				`${func.name.toUpperCase()}`,
				`CONTRACT_${func.name.toUpperCase()}`,
			],
			validate: async () => true,
			handler: async (runtime, message, state, _options, callback) => {
				try {
					// Parse input arguments if the function has inputs
					let args: any[] = [];

					if (func.inputs.length > 0) {
						const parseResult = await inputParser.parseInputs({
							runtime,
							message,
							state,
							template: FUNCTION_ARGUMENT_TEMPLATE,
							functionMetadata: func,
						});

						if (parseResult.error) {
							callback?.({
								text: `❌ Error parsing arguments: ${parseResult.error}`,
							});
							return false;
						}

						args = parseResult.args || [];
					}

					if (func.isReadFunction) {
						const result = await contractService.callReadFunction(
							func.name,
							args,
						);

						callback?.({
							text: dedent`
                ✅ Successfully called ${func.name}
                
                Result: ${JSON.stringify(result, null, 2)}
              `,
						});
					} else {
						const { hash } = await contractService.callWriteFunction(
							func.name,
							args,
						);

						callback?.({
							text: dedent`
                ✅ Successfully executed ${func.name}
                
                Transaction hash: ${hash}
                
                You can view this transaction on the blockchain explorer.
              `,
						});
					}
					return true;
				} catch (error) {
					elizaLogger.error(`Error executing ${func.name}:`, error);

					callback?.({
						text: dedent`
              ❌ Error with ${func.name}
              
              ${(error as Error).message}
            `,
					});
					return false;
				}
			},
			examples: [],
		};

		actions.push(action);
	}

	return actions;
}
