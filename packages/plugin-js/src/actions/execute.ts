import { type Action, elizaLogger } from "@elizaos/core";
import dedent from "dedent";
import { EXECUTE_JS_TEMPLATE } from "../lib/templates";
import { ExecuteService } from "../services/execute";
import { InputParserService } from "../services/input-parser";

export interface JsActionParams {
	memoryLimit?: number;
	timeout?: number;
}

export const getExecuteJsAction = (opts: JsActionParams): Action => {
	return {
		name: "JS_EXECUTE",
		description: "Execute JavaScript code in a secure sandbox",
		similes: ["RUN_JS", "EVALUATE_JS", "EXECUTE_JAVASCRIPT", "RUN_JAVASCRIPT"],
		validate: async () => true,
		handler: handler(opts),
		examples: [
			[
				{
					user: "user",
					content: {
						text: "run this JavaScript: const a = 2 + 2; return a * 3;",
					},
				},
				{
					user: "system",
					content: {
						text: `
              ✅ JavaScript Execution Successful

              Result: 12

              Execution Stats:
              ⏱️ CPU Time: 0.24ms
              🧠 Memory Used: 2.1MB
            `,
					},
				},
			],
		],
	};
};

const handler = (opts: JsActionParams) => {
	return async (runtime, message, state, _options, callback) => {
		elizaLogger.info("Starting JavaScript execution action");

		const memoryLimit = opts.memoryLimit || 128;
		const timeout = opts.timeout || 5000;

		try {
			const inputParser = new InputParserService();
			const { code, error } = await inputParser.parseInputs({
				runtime,
				message,
				state,
				template: EXECUTE_JS_TEMPLATE,
			});

			elizaLogger.info(
				`JavaScript Execution Request: ${code.substring(0, 100)}...`,
			);

			if (error) {
				callback?.({
					text: `❌ ${error}`,
				});
				return false;
			}

			const executeService = new ExecuteService({
				memoryLimit,
				timeout,
			});

			try {
				const result = await executeService.execute({ code });

				if (result.success) {
					const formattedResult =
						typeof result.result === "object"
							? JSON.stringify(result.result, null, 2)
							: String(result.result);

					// Prepare console output display
					const consoleOutputText =
						result.consoleOutput.length > 0
							? `Console Output:\n\`\`\`\n${result.consoleOutput.join("\n")}\n\`\`\``
							: "";

					// Decide what to show as the primary result
					const primaryResult =
						result.result !== undefined
							? `Result: ${formattedResult}`
							: result.consoleOutput.length > 0
								? "No return value, but console output was captured."
								: "No result or console output.";

					callback?.({
						text: dedent`
              ✅ JavaScript Execution Successful

              ${primaryResult}

              ${consoleOutputText}

              Execution Stats:
              ⏱️ CPU Time: ${result.stats?.cpuTime.toFixed(2)}ms
              🧠 Memory Used: ${(result.stats?.memoryUsage / (1024 * 1024)).toFixed(2)}MB
            `,
					});
				} else {
					callback?.({
						text: dedent`
              ❌ JavaScript Execution Failed

              Error Type: ${result.errorType}
              Message: ${result.message}

              Please check your code and try again.
            `,
					});
				}

				return result.success;
			} finally {
				executeService.dispose();
			}
		} catch (error) {
			callback?.({
				text: dedent`
          ❌ JavaScript Execution Failed

          Error: ${error.message}

          Please verify your code and try again.
        `,
			});
			return false;
		}
	};
};
