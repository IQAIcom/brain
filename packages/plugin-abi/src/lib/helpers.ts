import { elizaLogger } from "@elizaos/core";
import type { FunctionMetadata } from "../types";
import type { Abi } from "viem";

export function extractFunctionsFromAbi(abi: Abi): FunctionMetadata[] {
	return abi
		.filter((item) => item.type === "function")
		.map((item) => ({
			name: item.name,
			stateMutability: item.stateMutability,
			inputs: [...(item.inputs || [])],
			outputs: [...(item.outputs || [])],
			isReadFunction:
				item.stateMutability === "view" || item.stateMutability === "pure",
		}));
}

export async function withRetry<T>(
	operation: () => Promise<T>,
	options: {
		maxRetries?: number;
		initialBackoffMs?: number;
		logPrefix?: string;
	} = {},
): Promise<T> {
	const maxRetries = options.maxRetries ?? 3;
	let backoffMs = options.initialBackoffMs ?? 1000;
	let retryCount = 0;
	const logPrefix = options.logPrefix ? `[${options.logPrefix}] ` : "";

	while (true) {
		try {
			return await operation();
		} catch (error) {
			retryCount++;

			if (retryCount >= maxRetries) {
				elizaLogger.error(
					`${logPrefix}Operation failed after ${maxRetries} attempts`,
				);
				throw error;
			}

			elizaLogger.info(
				`${logPrefix}Retrying operation (attempt ${retryCount}/${maxRetries}) in ${backoffMs}ms...`,
			);

			await new Promise((resolve) => setTimeout(resolve, backoffMs));
			backoffMs *= 2;
		}
	}
}

export function formatResult(result: any) {
	if (typeof result === "bigint") {
		return result.toString();
	}

	if (Array.isArray(result)) {
		return result.map((item) => formatResult(item));
	}

	if (result && typeof result === "object") {
		const formatted = {};
		for (const key in result) {
			formatted[key] = formatResult(result[key]);
		}
		return formatted;
	}

	return result;
}
