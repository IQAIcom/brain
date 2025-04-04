import type { Plugin } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import { ContractService } from "./services/contract";
import { generateActionsFromAbi } from "./actions/generate-actions";
import { extractFunctionsFromAbi } from "./lib/helpers";
import { DEFAULT_CHAIN } from "./lib/constants";
import type { AbiPluginOptions } from "./types";

export async function createAbiPlugin(
	options: AbiPluginOptions,
): Promise<Plugin> {
	const {
		abi,
		contractName,
		contractAddress,
		description,
		privateKey,
		chain = DEFAULT_CHAIN,
	} = options;

	if (!privateKey) {
		throw new Error("Private key is required for ABI Plugin");
	}

	if (!contractAddress) {
		throw new Error("Contract address is required for ABI Plugin");
	}

	if (!abi || !Array.isArray(abi) || abi.length === 0) {
		throw new Error("Valid ABI is required for ABI Plugin");
	}

	try {
		const contractService = new ContractService(
			abi,
			contractAddress,
			privateKey,
			chain,
		);

		const functions = extractFunctionsFromAbi(abi);

		if (functions.length === 0) {
			throw new Error("No callable functions found in the provided ABI");
		}

		const actions = generateActionsFromAbi(
			contractService,
			contractName,
			functions,
		);

		elizaLogger.info(
			`🚀 ABI Plugin created with ${actions.length} actions for contract ${contractName}`,
		);

		return {
			name: `${contractName} Contract`,
			description:
				description ||
				`Plugin for interacting with ${contractName} smart contract`,
			providers: [],
			evaluators: [],
			services: [],
			actions,
		};
	} catch (error) {
		elizaLogger.error("❌ Failed to create ABI Plugin", { error });
		throw error;
	}
}

export default createAbiPlugin;
