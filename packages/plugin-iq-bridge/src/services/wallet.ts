import {
	http,
	type Chain,
	type PublicClient,
	type WalletClient,
	createPublicClient,
	createWalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { fraxtal, mainnet } from "viem/chains";

export class WalletService {
	private ethClient: PublicClient;
	private fraxtalClient: PublicClient;
	private walletClient?: WalletClient;

	constructor(privateKey: string) {
		this.ethClient = createPublicClient({
			chain: mainnet,
			transport: http(),
		}) as PublicClient;

		this.fraxtalClient = createPublicClient({
			chain: fraxtal,
			transport: http(),
		}) as PublicClient;

		try {
			const account = privateKeyToAccount(
				`0x${privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey}`,
			);
			this.walletClient = createWalletClient({
				account,
				chain: fraxtal,
				transport: http(),
			});
		} catch (error) {
			console.error("Error initializing wallet client:", error);
			throw new Error(
				`Failed to initialize wallet: ${(error as Error).message}`,
			);
		}
	}
	getEthClient(): PublicClient {
		return this.ethClient;
	}

	getFraxtalClient(): PublicClient {
		return this.fraxtalClient;
	}

	getWalletClient(): WalletClient | undefined {
		return this.walletClient;
	}
}
