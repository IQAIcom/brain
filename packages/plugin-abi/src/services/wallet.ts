import {
	http,
	type Chain,
	type PublicClient,
	type WalletClient,
	createPublicClient,
	createWalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";

export class WalletService {
	private publicClient: PublicClient;
	private walletClient?: WalletClient;

	constructor(privateKey: string, chain: Chain) {
		this.publicClient = createPublicClient({
			chain: chain,
			transport: http(),
		});

		try {
			const account = privateKeyToAccount(
				`0x${privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey}`,
			);
			this.walletClient = createWalletClient({
				account,
				chain: chain,
				transport: http(),
			});
		} catch (error) {
			console.error("Error initializing wallet client:", error);
			throw new Error(
				`Failed to initialize wallet: ${(error as Error).message}`,
			);
		}
	}

	getPublicClient(): PublicClient {
		return this.publicClient;
	}

	getWalletClient(): WalletClient | undefined {
		return this.walletClient;
	}
}
