import type { Address, PublicClient, WalletClient } from "viem";
import { FRAXLEND_ABI } from "../constants/abi";
import {
	composeContext,
	generateMessageResponse,
	type HandlerCallback,
	ModelClass,
	type Action,
	type IAgentRuntime,
	type Memory,
	type State,
} from "@elizaos/core";
import { getDepositTemplate } from "../lib/templates";

export const getDepositAction = (): Action => {
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
		handler: depositHandler,
		examples: [],
	};
};

async function depositHandler(
	runtime: IAgentRuntime,
	message: Memory,
	state: State | undefined,
	_options: { [key: string]: unknown },
	callback: HandlerCallback,
) {
	let currentState = state;
	if (!state) {
		currentState = (await runtime.composeState(message)) as State;
	}
	currentState = await runtime.updateRecentMessageState(state);

	const depositContext = composeContext({
		state: currentState,
		template: getDepositTemplate,
	});

	const content = await generateMessageResponse({
		runtime,
		context: depositContext,
		modelClass: ModelClass.SMALL,
	});

	const { pairAddress, amount } = JSON.parse(content.text) || {};
	if (!pairAddress || !amount) {
		if (callback) {
			callback({
				text: "Invalid deposit information provided",
				content: { error: "Missing pair address or amount" },
			});
		}
		return false;
	}

	try {
		const result = await deposit(
			pairAddress,
			BigInt(amount),
			runtime.publicClient,
			runtime.walletClient,
		);

		if (callback) {
			callback({
				text: `Successfully deposited ${amount} tokens into pool ${pairAddress}. Transaction hash: ${result.data.txHash}`,
				content: result.data,
			});
		}
		return true;
	} catch (error) {
		if (callback) {
			callback({
				text: `Error during deposit: ${error.message}`,
				content: { error: error.message },
			});
		}
		return false;
	}
}

async function deposit(
	pairAddress: Address,
	amount: bigint,
	publicClient: PublicClient,
	walletClient: WalletClient,
) {
	const { request } = await publicClient.simulateContract({
		address: pairAddress,
		abi: FRAXLEND_ABI,
		functionName: "addAsset",
		args: [amount, await walletClient.getAddresses()],
	});

	const hash = await walletClient.writeContract(request);
	const receipt = await publicClient.waitForTransactionReceipt({ hash });

	return {
		success: true,
		data: {
			txHash: receipt.transactionHash,
			amount,
		},
	};
}
