import { type Address, erc20Abi } from "viem";
import type { WalletService } from "./wallet";

export class SwapService {
	private walletService: WalletService;

	constructor(walletService: WalletService) {
		this.walletService = walletService;
	}

	async execute({
		// biome-ignore lint/correctness/noUnusedVariables: <explanation>
		pairAddress,
		// biome-ignore lint/correctness/noUnusedVariables: <explanation>
		amount,
	}: { pairAddress: Address; amount: bigint }) {
		throw new Error("Not implemented")
	}

	private async ensureTokenApproval(
		// biome-ignore lint/correctness/noUnusedVariables: <explanation>
		assetAddress: Address,
		// biome-ignore lint/correctness/noUnusedVariables: <explanation>
		spenderAddress: Address,
		// biome-ignore lint/correctness/noUnusedVariables: <explanation>
		amount: bigint,
	) {
		throw new Error("Not implemented")
	}
}
