import { erc20Abi } from "viem";
import type { Address } from "viem";
import type { WalletService } from "./wallet";
import { BAMM_ABI } from "../lib/bamm.abi";
import { elizaLogger } from "@elizaos/core";

export interface RepayParams {
	bammAddress: Address;
	/** The token that was borrowed (either token0 or token1 in the BAMM) */
	borrowToken: Address;
	amount: string;
}

export class RepayService {
	constructor(private walletService: WalletService) {}

	/**
	 * Repays the borrowed amount by interacting with the BAMM contract.
	 * We automatically derive which token is collateral by reading token0/token1 from BAMM.
	 */
	async execute(params: RepayParams): Promise<{ txHash: string }> {
		const { bammAddress, borrowToken, amount } = params;
		const publicClient = this.walletService.getPublicClient();
		const walletClient = this.walletService.getWalletClient();
		const userAddress = walletClient.account.address;
		const amountInWei = BigInt(Math.floor(Number(amount) * 1e18));

		try {
			// 1. Determine token0 / token1 from BAMM
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

			// 2. Figure out if the user is repaying token0 or token1
			// We'll set the appropriate field to negative in the action.
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

			// 3. Check if the user has enough of the borrowed token to repay
			const balance: bigint = await publicClient.readContract({
				address: borrowToken,
				abi: erc20Abi,
				functionName: "balanceOf",
				args: [userAddress],
			});
			if (balance < amountInWei) {
				throw new Error("Insufficient balance of borrowed token to repay");
			}

			// 4. Approve the BAMM contract to spend the borrowed token if needed
			await this.ensureTokenApproval(borrowToken, bammAddress, amountInWei);

			// 5. Construct the Action object for repaying the borrowed tokens
			const currentTime = Math.floor(Date.now() / 1000);
			const deadline = BigInt(currentTime + 300);

			const action = {
				token0Amount: isBorrowingToken0 ? amountInWei : 0n,
				token1Amount: isBorrowingToken0 ? 0n : amountInWei,
				rent: -amountInWei,
				to: userAddress,
				token0AmountMin: 0n,
				token1AmountMin: 0n,
				closePosition: false,
				approveMax: false,
				v: 0,
				r: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
				s: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
				deadline,
			};

			// 6. Call executeActions to perform the repayment
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
