import type { Abi, Address } from "viem";
import type { WalletService } from "./wallet";
import { DEFAULT_GAS_LIMIT_MULTIPLIER } from "../lib/constants";

export class ContractService {
	constructor(
		private walletService: WalletService,
		private abi: Abi,
		private address: Address,
	) {}
	// biome-ignore lint: <explanation>
	async executeRead(functionName: string, args: any[]) {
		const publicClient = this.walletService.getPublicClient();
		return publicClient.readContract({
			address: this.address,
			abi: this.abi,
			functionName,
			args,
		});
	}
	// biome-ignore lint: <explanation>
	async executeWrite(functionName: string, args: any[]) {
		const walletClient = this.walletService.getWalletClient();
		const publicClient = this.walletService.getPublicClient();

		if (!walletClient?.account) {
			throw new Error("Wallet not configured for write operations");
		}

		const { request } = await publicClient.simulateContract({
			address: this.address,
			abi: this.abi,
			functionName,
			args,
			account: walletClient.account,
		});

		// Add gas estimate with buffer
		const gasLimit = BigInt(
			Math.ceil(Number(request.gas) * DEFAULT_GAS_LIMIT_MULTIPLIER),
		);
		return walletClient.writeContract({
			...request,
			gas: gasLimit,
		});
	}
}
