import {
	http,
	type Chain,
	type PublicClient,
	type WalletClient,
	createPublicClient,
	createWalletClient,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { fraxtal } from "viem/chains";

export class WalletService {
	private publicClient: PublicClient;
	private walletClient?: WalletClient;

	constructor(privateKey?: string, chain: Chain = fraxtal) {
		this.publicClient = createPublicClient({
			chain,
			transport: http(),
		}) as PublicClient;

		if (privateKey) {
			const account = privateKeyToAccount(`0x${privateKey}`);
			this.walletClient = createWalletClient({
				account,
				chain,
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
