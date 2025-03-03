import { elizaLogger } from "@elizaos/core";
import ivm from "isolated-vm";
import { promisify } from "node:util";

type SecureJsVMOptions = {
	memoryLimit?: number;
	timeout?: number;
};

export interface ExecuteParams {
	code: string;
}

export type ExecutionResult = {
	success: boolean;
	result?: unknown;
	consoleOutput: string[];
	stats?: {
		cpuTime: number;
		wallTime: number;
		memoryUsage: number;
	};
	errorType?: string;
	message?: string;
	stack?: string;
};

export class ExecuteService {
	private isolate: ivm.Isolate;
	private context: ivm.Context | null = null;
	private initialized: Promise<void>;
	private timeout: number;
	private memoryLimit: number;
	private consoleOutput: string[] = [];

	constructor(options: SecureJsVMOptions = {}) {
		this.memoryLimit = options.memoryLimit || 128;
		this.timeout = options.timeout || 5000;

		this.isolate = new ivm.Isolate({
			memoryLimit: this.memoryLimit,
			onCatastrophicError: (error) =>
				this.handleCatastrophicError(Error(error)),
		});

		this.initialized = this.initializeContext();
	}

	private async initializeContext(): Promise<void> {
		try {
			this.context = await this.isolate.createContext();
			const jail = this.context.global;

			await jail.set("global", jail.derefInto());

			this.consoleOutput = [];

			// Setup secure console API with output capturing
			await this.context.evalClosure(
				`global.console = {
          log: (...args) => {
            const formatted = args.map(arg =>
              typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ');
            $0.apply(undefined, [formatted], { arguments: { copy: true } });
          },
          error: (...args) => {
            const formatted = args.map(arg =>
              typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ');
            $1.apply(undefined, [formatted], { arguments: { copy: true } });
          }
        };`,
				[
					(text: string) => {
						console.log("[VM]", text);
						this.consoleOutput.push(text);
					},
					(text: string) => {
						console.error("[VM Error]", text);
						this.consoleOutput.push(`ERROR: ${text}`);
					},
				],
			);
		} catch (error) {
			this.dispose();
			throw new Error(
				`Context initialization failed: ${(error as Error).message}`,
			);
		}
	}

	public async execute(params: ExecuteParams): Promise<ExecutionResult> {
		const { code } = params;
		await this.initialized;

		if (!this.context) throw new Error("VM context not initialized");

		this.consoleOutput = [];

		const wrappedCode = `
      (function() {
        let __result;
        try {
          __result = (function() { ${code} })();
          return {
            returned: __result
          };
        } catch(e) {
          return {
            error: {
              message: e.message,
              name: e.name,
              stack: e.stack
            }
          };
        }
      })()
    `;

		// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
		let script;
		try {
			script = await this.isolate.compileScript(wrappedCode, {
				filename: "user-code.js",
			});

			const executionResult = await Promise.race([
				script.run(this.context, {
					promise: true,
					timeout: this.timeout,
					copy: true,
				}),
				promisify(setTimeout)(this.timeout).then(() => {
					throw new Error(`Execution timed out after ${this.timeout}ms`);
				}),
			]);

			if (executionResult?.error) {
				throw new Error(executionResult.error.message);
			}

			return {
				success: true,
				result: executionResult?.returned,
				consoleOutput: [...this.consoleOutput],
				stats: {
					cpuTime: Number(this.isolate.cpuTime),
					wallTime: Number(this.isolate.wallTime),
					memoryUsage: (await this.isolate.getHeapStatistics()).used_heap_size,
				},
			};
		} catch (error) {
			return this.handleExecutionError(error as Error);
		} finally {
			if (script) script.release();
		}
	}

	private handleExecutionError(error: Error): ExecutionResult {
		elizaLogger.error("Error in JavaScript execution", error);

		const errorResult: ExecutionResult = {
			success: false,
			consoleOutput: [...this.consoleOutput],
			errorType: "ExecutionError",
			message: error.message,
			stack: error.stack,
		};

		if (error.message.includes("Script execution timed out")) {
			errorResult.errorType = "TimeoutError";
		} else if (error.message.includes("Memory limit exceeded")) {
			errorResult.errorType = "MemoryError";
		} else if (error.message.match(/SyntaxError|ReferenceError|TypeError/)) {
			errorResult.errorType = error.name;
		}

		return errorResult;
	}

	private handleCatastrophicError(error: Error): void {
		elizaLogger.error("Catastrophic VM failure:", error);
		this.dispose();
	}

	public dispose(): void {
		if (this.context) {
			this.context.release();
			this.context = null;
		}
		this.isolate.dispose();
	}
}
