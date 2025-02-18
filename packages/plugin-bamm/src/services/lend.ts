import { erc20Abi } from "viem";
import type { Address } from "viem";
import type { WalletService } from "./wallet";
import { BAMM_ABI } from "../lib/bamm.abi";
import { elizaLogger } from "@elizaos/core";

export interface LendParams {
	bammAddress: Address;
	/** The amount of Fraxswap LP tokens to deposit, in normal decimal form (e.g. "10" for 10 tokens) */
	amount: string;
}

export class LendService {
	constructor(private walletService: WalletService) {}

	/**
	 * Lend Fraxswap LP tokens to the BAMM contract.
	 * Reads the LP token address from bamm.pair(), approves the BAMM to spend them if needed,
	 * and calls bamm.mint() to deposit.
	 */
	async execute(params: LendParams): Promise<{ txHash: string }> {
		const { bammAddress, amount } = params;
		const publicClient = this.walletService.getPublicClient();
		const walletClient = this.walletService.getWalletClient();
		const userAddress = walletClient.account.address;
		const lpAmountWei = BigInt(Math.floor(Number(amount) * 1e18));
		try {
			// 1. Read the Fraxswap LP token address from the BAMM contract
			const lpTokenAddress: Address = await publicClient.readContract({
				address: bammAddress,
				abi: BAMM_ABI,
				functionName: "pair",
				args: [],
			});

			// 2. Check user’s LP token balance
			const balance: bigint = await publicClient.readContract({
				address: lpTokenAddress,
				abi: erc20Abi,
				functionName: "balanceOf",
				args: [userAddress],
			});
			if (balance < lpAmountWei) {
				throw new Error("Insufficient Fraxswap LP token balance");
			}

			// 3. Approve the BAMM contract to spend LP tokens if needed
			const allowance: bigint = await publicClient.readContract({
				address: lpTokenAddress,
				abi: erc20Abi,
				functionName: "allowance",
				args: [userAddress, bammAddress],
			});
			if (allowance < lpAmountWei) {
				const { request: approveRequest } = await publicClient.simulateContract(
					{
						address: lpTokenAddress,
						abi: erc20Abi,
						functionName: "approve",
						args: [bammAddress, lpAmountWei],
						account: walletClient.account,
					},
				);
				await walletClient.writeContract(approveRequest);
			}
			// 4. Call bamm.mint(to, lpIn) to deposit LP and receive BAMM tokens
			const { request: mintRequest } = await publicClient.simulateContract({
				address: bammAddress,
				abi: BAMM_ABI,
				functionName: "mint",
				args: [userAddress, lpAmountWei],
				account: walletClient.account,
			});
			const txHash = await walletClient.writeContract(mintRequest);
			await publicClient.waitForTransactionReceipt({ hash: txHash });

			return { txHash };
		} catch (error) {
			elizaLogger.error("Error in lend service", error);
			throw error;
		}
	}
}
