import { type Address, erc20Abi } from "viem";
import { FRAXLEND_ABI } from "../lib/fraxlend.abi";
import type { WalletService } from "./wallet";

export class WithdrawService {
	private walletService: WalletService;

	constructor(walletService: WalletService) {
		this.walletService = walletService;
	}

	async execute({
		pairAddress,
		amount,
	}: { pairAddress: Address; amount: bigint }) {
		const publicClient = this.walletService.getPublicClient();
		const walletClient = this.walletService.getWalletClient();
		const userAddress = walletClient.account.address;

		const shares = await publicClient.readContract({
			address: pairAddress,
			abi: FRAXLEND_ABI,
			functionName: "balanceOf",
			args: [userAddress],
			account: walletClient.account,
		});

		if (shares < amount) {
			throw new Error(
				`Insufficient shares for withdrawal. Available: ${shares}, Requested: ${amount}`,
			);
		}

		const { request } = await publicClient.simulateContract({
			address: pairAddress,
			abi: FRAXLEND_ABI,
			functionName: "redeem",
			args: [amount, userAddress, userAddress],
			account: walletClient.account,
		});

		const hash = await walletClient.writeContract(request);
		const receipt = await publicClient.waitForTransactionReceipt({ hash });

		return {
			txHash: receipt.transactionHash,
			amount,
		};
	}
}
