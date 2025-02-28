import type { WalletService } from "./wallet";

export interface AssembleResponseTxn {
	chainId: number; // Chain ID for path execution
	gas: string; // Gas limit (2x naive or 1.1x simulated)
	gasPrice: string; // Gas price for path calculation
	value: string; // Input gas token amount (0 if not input)
	to: string; // Odos router address
	from: string; // Transaction source address
	data: string; // Router calldata for DEX swaps
	nonce: number; // Transaction nonce
}

export class AssembleService {
	private readonly API_URL = "https://api.odos.xyz";
	private readonly walletService: WalletService;

	constructor(walletService: WalletService) {
		this.walletService = walletService;
	}

	async execute(pathId: string) {
		const walletClient = this.walletService.getWalletClient();
		const userAddr = walletClient?.account?.address;
		if (!userAddr) {
			throw new Error("User address is not defined");
		}
		try {
			const response = await fetch(`${this.API_URL}/sor/assemble`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userAddr,
					pathId,
				}),
			});
			if (!response.ok) {
				throw new Error(
					`HTTP error! status: ${response.status} - ${response.statusText}`,
				);
			}
			const data = await response.json();
			return data.transaction as AssembleResponseTxn;
		} catch (error) {
			console.error("Error assembling path:", error);
		}
	}
}
