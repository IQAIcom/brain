import type { Address } from "viem";
import { FRAXLEND_ABI } from "../constants/abi";
import type { WalletService } from "./wallet";

export class WithdrawService {
	private walletService: WalletService;

	constructor(walletService: WalletService) {
		this.walletService = walletService;
	}

	async execute({
		pairAddress,
		shares,
	}: { pairAddress: Address; shares: bigint }) {
		const publicClient = this.walletService.getPublicClient();
		const walletClient = this.walletService.getWalletClient();

		const { request } = await publicClient.simulateContract({
			address: pairAddress,
			abi: FRAXLEND_ABI,
			functionName: "removeAsset",
			args: [shares, await walletClient.getAddresses()],
		});

		const hash = await walletClient.writeContract(request);
		const receipt = await publicClient.waitForTransactionReceipt({ hash });

		return {
			success: true,
			data: {
				txHash: receipt.transactionHash,
				shares,
			},
		};
	}
}
