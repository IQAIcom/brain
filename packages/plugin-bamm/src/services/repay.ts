import { erc20Abi } from "viem";
import type { Address } from "viem";
import type { WalletService } from "./wallet";
import { BAMM_ABI } from "../lib/bamm.abi";
import { elizaLogger } from "@elizaos/core";

export interface RepayParams {
	bammAddress: Address;
	borrowToken: Address;
	amount: string;
}

export class RepayService {
	constructor(private walletService: WalletService) {}

	async execute(params: RepayParams): Promise<{ txHash: string }> {
		const { bammAddress, borrowToken, amount } = params;
		const publicClient = this.walletService.getPublicClient();
		const walletClient = this.walletService.getWalletClient();
		const userAddress = walletClient.account.address;
		const amountInWei = BigInt(Math.floor(Number(amount) * 1e18));

		try {
			const token0: Address = await publicClient.readContract({
				address: bammAddress,
				abi: BAMM_ABI,
				functionName: "token0",
				args: [],
			});
			const token1: Address = await publicClient.readContract({
				address: bammAddress,
				abi: BAMM_ABI,
				functionName: "token1",
				args: [],
			});

			const normalizedBorrowToken = borrowToken.toLowerCase();
			const normalizedToken0 = token0.toLowerCase();
			const normalizedToken1 = token1.toLowerCase();

			let isBorrowingToken0: boolean;
			if (normalizedBorrowToken === normalizedToken0) {
				isBorrowingToken0 = true;
			} else if (normalizedBorrowToken === normalizedToken1) {
				isBorrowingToken0 = false;
			} else {
				throw new Error(
					"borrowToken does not match token0 or token1 in the BAMM",
				);
			}

			const balance: bigint = await publicClient.readContract({
				address: borrowToken,
				abi: erc20Abi,
				functionName: "balanceOf",
				args: [userAddress],
			});
			if (balance < amountInWei) {
				throw new Error("Insufficient balance of borrowed token to repay");
			}

			await this.ensureTokenApproval(borrowToken, bammAddress, amountInWei);

			const rentedMultiplier: bigint = await publicClient.readContract({
				address: bammAddress,
				abi: BAMM_ABI,
				functionName: "rentedMultiplier",
				args: [],
			});

			// Calculate effective rent for repayment (negative rent for repayment)
			const effectiveRent =
				-(amountInWei * 1_000_000_000_000_000_000n) / rentedMultiplier;

			const currentTime = Math.floor(Date.now() / 1000);
			const deadline = BigInt(currentTime + 300);

			// Construct the action object for repayment
			const action = {
				token0Amount: isBorrowingToken0 ? amountInWei : 0n, // repay token0 if borrowing token0
				token1Amount: isBorrowingToken0 ? 0n : amountInWei, // repay token1 if borrowing token1
				rent: effectiveRent, // reduce the rent by paying it back
				to: userAddress,
				token0AmountMin: 0n, // slippage tolerance for token0, if any
				token1AmountMin: 0n, // slippage tolerance for token1, if any
				closePosition: false, // don't close the position yet
				approveMax: false, // don't approve max, just the required amount
				v: 0,
				r: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
				s: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
				deadline,
			};

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
			elizaLogger.error("Error repaying:", error);
			throw error;
		}
	}

	private async ensureTokenApproval(
		tokenAddress: Address,
		spenderAddress: Address,
		amount: bigint,
	) {
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
}
