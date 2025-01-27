import type { Address, PublicClient, WalletClient } from "viem";
import { FRAXLEND_ABI } from "../lib/fraxlend.abi";
import type { WalletService } from "./wallet";

export class DepositService {
	private walletService: WalletService;

	constructor(walletService: WalletService) {
		this.walletService = walletService;
	}

	async execute({ pairAddress, amount }: DepositParams) {
		const publicClient = this.walletService.getPublicClient();
		const walletClient = this.walletService.getWalletClient();

		const { request } = await publicClient.simulateContract({
			address: pairAddress,
			abi: FRAXLEND_ABI,
			functionName: "addAsset",
			args: [amount, await walletClient.getAddresses()],
		});

		const hash = await walletClient.writeContract(request);
		const receipt = await publicClient.waitForTransactionReceipt({ hash });

		return {
			txHash: receipt.transactionHash,
			amount,
		};
	}
}

export interface DepositParams {
	pairAddress: Address;
	amount: bigint;
}
