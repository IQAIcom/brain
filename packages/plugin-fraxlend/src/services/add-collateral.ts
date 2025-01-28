import { type Address, erc20Abi } from "viem";
import { FRAXLEND_ABI } from "../lib/fraxlend.abi";
import type { WalletService } from "./wallet";

export class AddCollateralService {
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

		const collateralAddress = await publicClient.readContract({
			address: pairAddress,
			abi: FRAXLEND_ABI,
			functionName: "collateralContract",
		});

		const balance = await publicClient.readContract({
			address: collateralAddress,
			abi: erc20Abi,
			functionName: "balanceOf",
			args: [userAddress],
		});

		if (balance < amount) {
			throw new Error(
				`Insufficient collateral balance. Available: ${balance}, Requested: ${amount}`,
			);
		}

		await this.ensureTokenApproval(collateralAddress, pairAddress, amount);

		const { request } = await publicClient.simulateContract({
			address: pairAddress,
			abi: FRAXLEND_ABI,
			functionName: "addCollateral",
			args: [amount, userAddress],
			account: walletClient.account,
		});

		const hash = await walletClient.writeContract(request);
		const receipt = await publicClient.waitForTransactionReceipt({ hash });

		return {
			txHash: receipt.transactionHash,
			amount,
		};
	}

	private async ensureTokenApproval(
		collateralAddress: Address,
		spenderAddress: Address,
		amount: bigint,
	) {
		const publicClient = this.walletService.getPublicClient();
		const walletClient = this.walletService.getWalletClient();
		const userAddress = walletClient.account.address;

		const currentAllowance = await publicClient.readContract({
			address: collateralAddress,
			abi: erc20Abi,
			functionName: "allowance",
			args: [userAddress, spenderAddress],
		});

		if (currentAllowance < amount) {
			const { request: approveRequest } = await publicClient.simulateContract({
				address: collateralAddress,
				abi: erc20Abi,
				functionName: "approve",
				args: [spenderAddress, amount],
				account: walletClient.account,
			});
			await walletClient.writeContract(approveRequest);
		}
	}
}
