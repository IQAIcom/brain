import { erc20Abi } from "viem";
import type { Address } from "viem";
import type { WalletService } from "./wallet";
import { BAMM_ABI } from "../lib/bamm.abi";
import { elizaLogger } from "@elizaos/core";

export interface WithdrawParams {
	bammAddress: Address;
	/** The amount of BAMM tokens (in normal decimals) to redeem for Fraxswap LP */
	amount: string;
}

export class WithdrawService {
	constructor(private walletService: WalletService) {}

	/**
	 * Redeem your BAMM tokens for Fraxswap LP tokens via bamm.redeem(to, bammIn).
	 */
	async execute(params: WithdrawParams): Promise<{ txHash: string }> {
		const { bammAddress, amount: bammAmount } = params;
		const publicClient = this.walletService.getPublicClient();
		const walletClient = this.walletService.getWalletClient();
		const userAddress = walletClient.account.address;
		const bammAmountWei = BigInt(Math.floor(Number(bammAmount) * 1e18));

		try {
			// 1. Find the BAMM ERC20 token address from bamm.iBammErc20()
			const bammErc20Address: Address = await publicClient.readContract({
				address: bammAddress,
				abi: BAMM_ABI,
				functionName: "iBammErc20",
				args: [],
			});

			// 2. Check user's BAMM token balance
			const bammBalance: bigint = await publicClient.readContract({
				address: bammErc20Address,
				abi: erc20Abi,
				functionName: "balanceOf",
				args: [userAddress],
			});
			if (bammBalance < bammAmountWei) {
				throw new Error("Insufficient BAMM token balance");
			}

			// 3. Approve the BAMM contract if needed
			const currentAllowance: bigint = await publicClient.readContract({
				address: bammErc20Address,
				abi: erc20Abi,
				functionName: "allowance",
				args: [userAddress, bammAddress],
			});
			if (currentAllowance < bammAmountWei) {
				const { request: approveRequest } = await publicClient.simulateContract(
					{
						address: bammErc20Address,
						abi: erc20Abi,
						functionName: "approve",
						args: [bammAddress, bammAmountWei],
						account: walletClient.account,
					},
				);
				await walletClient.writeContract(approveRequest);
			}

			// 4. Call bamm.redeem(to, bammIn)
			const { request: redeemRequest } = await publicClient.simulateContract({
				address: bammAddress,
				abi: BAMM_ABI,
				functionName: "redeem",
				args: [userAddress, bammAmountWei],
				account: walletClient.account,
			});
			const txHash = await walletClient.writeContract(redeemRequest);
			await publicClient.waitForTransactionReceipt({ hash: txHash });

			return { txHash };
		} catch (error) {
			elizaLogger.error("Error in withdraw service:", error);
			throw error;
		}
	}
}
