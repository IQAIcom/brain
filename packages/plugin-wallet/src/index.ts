import type { Plugin } from "@elizaos/core";
import { getHoldingsAction } from "./actions/get-holdings";
import type { WalletActionParams } from "./types";
import { getTransactionsAction } from "./actions/get-transactions";

export async function createWalletPlugin(
	opts: WalletActionParams,
): Promise<Plugin> {
	if (!opts.covalentApiKey) {
		throw new Error("Covalent API key is required");
	}
	if (!opts.walletAddress) {
		throw new Error("Wallet address is required");
	}
	const actions = [getHoldingsAction(opts), getTransactionsAction(opts)];

	return {
		name: "Wallet Integration",
		description:
			"Plugin for accessing and managing blockchain wallet information",
		providers: [],
		evaluators: [],
		services: [],
		actions,
	};
}

export default createWalletPlugin;
