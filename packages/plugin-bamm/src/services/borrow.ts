import { erc20Abi } from "viem";
import type { Address } from "viem";
import type { WalletService } from "./wallet";
import { BAMM_ABI } from "../lib/bamm.abi";
import { elizaLogger } from "@elizaos/core";

export interface BorrowParams {
	bammAddress: Address;
	/** The token the user wants to borrow (either token0 or token1 from the BAMM) */
	borrowToken: Address;
	amount: string;
}

export class BorrowService {
	constructor(private walletService: WalletService) {}

	/**
	 * Borrow tokens from the BAMM contract, deriving the collateral token automatically.
	 * If borrowToken == token0, then collateral is token1. Otherwise, token0 is collateral.
	 */
	async execute(params: BorrowParams): Promise<{ txHash: string }> {
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

			// 2. Identify which is the collateral token
			// If the user is borrowing token0, the collateral is token1. Otherwise, token0 is collateral.
			const normalizedBorrowToken = borrowToken.toLowerCase();
			const normalizedToken0 = token0.toLowerCase();
			const normalizedToken1 = token1.toLowerCase();

			let collateralToken: Address;
			let isBorrowingToken0: boolean;

			if (normalizedBorrowToken === normalizedToken0) {
				collateralToken = token1;
				isBorrowingToken0 = true;
			} else if (normalizedBorrowToken === normalizedToken1) {
				collateralToken = token0;
				isBorrowingToken0 = false;
			} else {
				throw new Error(
					"borrowToken does not match token0 or token1 in the BAMM",
				);
			}

			// 3. Check user has enough collateral
			const balance: bigint = await publicClient.readContract({
				address: collateralToken,
				abi: erc20Abi,
				functionName: "balanceOf",
				args: [userAddress],
			});
			if (balance < amountInWei) {
				throw new Error("Insufficient collateral token balance");
			}

			// 4. Approve BAMM to spend the collateral if needed
			await this.ensureTokenApproval(collateralToken, bammAddress, amountInWei);

			// 5. Build the action object
			const currentTime = Math.floor(Date.now() / 1000);
			const deadline = BigInt(currentTime + 300);

			const action = {
				token0Amount: isBorrowingToken0 ? -amountInWei : 0n,
				token1Amount: isBorrowingToken0 ? 0n : -amountInWei,
				rent: amountInWei,
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

			// 6. Simulate & execute the transaction
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
			elizaLogger.error("Error in borrow service", error);
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
