import { type Address, erc20Abi } from "viem";
import { FRAXLEND_ABI } from "../lib/fraxlend.abi";
import type { WalletService } from "./wallet";

export class BorrowService {
	private walletService: WalletService;

	constructor(walletService: WalletService) {
		this.walletService = walletService;
	}

	async execute({
		pairAddress,
		borrowAmount,
		collateralAmount,
		receiver,
	}: {
		pairAddress: Address;
		borrowAmount: bigint;
		collateralAmount: bigint;
		receiver: Address;
	}) {
		const publicClient = this.walletService.getPublicClient();
		const walletClient = this.walletService.getWalletClient();
		const userAddress = walletClient.account.address;

		const collateralBalance = (await publicClient.readContract({
			address: pairAddress,
			abi: FRAXLEND_ABI,
			functionName: "userCollateralBalance",
			args: [userAddress],
			account: walletClient.account,
		})) as bigint;

		if (collateralBalance <= 0n) {
			throw new Error("You don't have any collateral to borrow with");
		}

		const { request } = await publicClient.simulateContract({
			address: pairAddress,
			abi: FRAXLEND_ABI,
			functionName: "borrowAsset",
			args: [borrowAmount, collateralAmount, receiver],
			account: walletClient.account,
		});

		const hash = await walletClient.writeContract(request);
		const receipt = await publicClient.waitForTransactionReceipt({ hash });

		return {
			txHash: receipt.transactionHash,
			borrowAmount,
			collateralAmount,
			receiver,
		};
	}
}
