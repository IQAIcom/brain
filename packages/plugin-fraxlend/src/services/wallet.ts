import {
	createWalletClient,
	createPublicClient,
	http,
	type PublicClient,
	type WalletClient,
	type Chain,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";

export class WalletService {
	private publicClient: PublicClient;
	private walletClient?: WalletClient;

	constructor(privateKey?: string, chain: Chain = mainnet) {
		this.publicClient = createPublicClient({
			chain,
			transport: http(),
		});

		if (privateKey) {
			const account = privateKeyToAccount(`0x${privateKey}`);
			this.walletClient = createWalletClient({
				account,
				chain: mainnet,
				transport: http(),
			});
		}
	}

	getPublicClient() {
		return this.publicClient;
	}

	getWalletClient() {
		return this.walletClient;
	}
}
