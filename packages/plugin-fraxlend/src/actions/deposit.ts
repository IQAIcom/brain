import {
	type Action,
	type Handler,
	ModelClass,
	composeContext,
	generateMessageResponse,
} from "@elizaos/core";
import { DEPOSIT_TEMPLATE } from "../lib/templates";
import { DepositService } from "../services/deposit";
import { WalletService } from "../services/wallet";
import type { FraxLendActionParams } from "../types";
export const getDepositAction = (opts: FraxLendActionParams): Action => {
	return {
		name: "FRAXLEND_DEPOSIT",
		description: "Deposit assets into a FraxLend pool",
		similes: [
			"DEPOSIT",
			"ADD_LIQUIDITY",
			"SUPPLY_ASSETS",
			"PROVIDE_LIQUIDITY",
			"FUND_POOL",
			"STAKE_ASSETS",
			"POOL_DEPOSIT",
			"LEND_ASSETS",
			"ADD_TO_POOL",
			"DEPOSIT_FUNDS",
		],
		validate: async () => true,
		handler: handler(opts),
		examples: [],
	};
};

const handler: (opts: FraxLendActionParams) => Handler =
	({ walletPrivateKey }) =>
	async (runtime, message, state, _options, callback) => {
		const currentState = state
			? await runtime.updateRecentMessageState(state)
			: await runtime.composeState(message);

		const depositContext = composeContext({
			state: currentState,
			template: DEPOSIT_TEMPLATE,
		});

		const content = await generateMessageResponse({
			runtime,
			context: depositContext,
			modelClass: ModelClass.SMALL,
		});

		const { pairAddress, amount } = JSON.parse(content.text) || {};

		if (!pairAddress || !amount) {
			callback?.({
				text: "Invalid deposit information provided",
				content: { error: "Missing pair address or amount" },
			});
			return false;
		}

		try {
			const walletService = new WalletService(walletPrivateKey);
			const depositService = new DepositService(walletService);

			const result = await depositService.execute({
				pairAddress,
				amount: BigInt(amount),
			});

			callback?.({
				text: `Successfully deposited ${amount} tokens into pool ${pairAddress}. Transaction hash: ${result.txHash}`,
			});
			return true;
		} catch (error) {
			callback?.({
				text: `Error during deposit: ${error.message}`,
				content: { error: error.message },
			});
			return false;
		}
	};
