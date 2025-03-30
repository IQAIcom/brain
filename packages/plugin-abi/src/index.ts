import type { Plugin } from "@elizaos/core";
import { elizaLogger } from "@elizaos/core";
import { ContractService } from "./services/contract.js";
import { generateActionsFromAbi } from "./actions/generate-actions.js";
import { extractFunctionsFromAbi } from "./lib/helpers.js";
import { DEFAULT_CHAIN } from "./lib/constants.js";
import type { AbiPluginOptions } from "./types.js";

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
		// Initialize contract service
		const contractService = new ContractService(
			abi,
			contractAddress,
			privateKey,
			chain,
		);

		// Extract function information from ABI
		const functions = extractFunctionsFromAbi(abi);

		if (functions.length === 0) {
			throw new Error("No callable functions found in the provided ABI");
		}

		// Generate actions for each function
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
