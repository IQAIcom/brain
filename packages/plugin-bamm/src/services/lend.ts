import { erc20Abi } from "viem";
import type { Address } from "viem";
import type { WalletService } from "./wallet";
import { BAMM_ABI } from "../lib/bamm.abi";
import { elizaLogger } from "@elizaos/core";

export interface LendParams {
	bammAddress: Address;
	tokenAddress: Address;
	amount: string;
}

export class LendService {
	constructor(private walletService: WalletService) {}

	private async ensureTokenApproval(
		tokenAddress: Address,
		spenderAddress: Address,
		amount: bigint,
	): Promise<void> {
		const publicClient = this.walletService.getPublicClient();
		const walletClient = this.walletService.getWalletClient();
		const userAddress = walletClient.account.address;

		const currentAllowance: bigint = await publicClient.readContract({
			address: tokenAddress,
			abi: erc20Abi,
			functionName: "allowance",
			args: [userAddress, spenderAddress],
		});

		if (currentAllowance < amount) {
			const { request: approveRequest } = await publicClient.simulateContract({
				address: tokenAddress,
				abi: erc20Abi,
				functionName: "approve",
				args: [spenderAddress, amount],
				account: walletClient.account,
			});
			await walletClient.writeContract(approveRequest);
		}
	}

	async execute(params: LendParams): Promise<{ txHash: string }> {
		const { bammAddress, tokenAddress, amount } = params;
		const publicClient = this.walletService.getPublicClient();
		const walletClient = this.walletService.getWalletClient();
		const userAddress = walletClient.account.address;

		const amountInWei = BigInt(Number(amount) * 1e18);

		await this.ensureTokenApproval(tokenAddress, bammAddress, amountInWei);

		const currentTime = Math.floor(Date.now() / 1000);
		const deadline = BigInt(currentTime + 300);

		const action = {
			token0Amount: amountInWei,
			token1Amount: 0n,
			rent: 0n,
			to: userAddress,
			token0AmountMin: amountInWei,
			token1AmountMin: 0n,
			closePosition: false,
			approveMax: false,
			v: 0,
			r: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
			s: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
			deadline,
		};
		try {
			// Simulate and send the transaction by calling executeActions on the BAMM contract.
			const { request: executeRequest } = await publicClient.simulateContract({
				address: bammAddress,
				abi: BAMM_ABI,
				functionName: "executeActions",
				args: [action],
				account: walletClient.account,
			});
			const txHash = await walletClient.writeContract(executeRequest);
			await publicClient.waitForTransactionReceipt({ hash: txHash });

			return { txHash };
		} catch (error) {
			elizaLogger.error("Error in lend service:", error);
			throw error;
		}
	}
}
