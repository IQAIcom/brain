import { erc20Abi } from "viem";
import type { Address } from "viem";
import type { WalletService } from "./wallet";
import { BAMM_ABI } from "../lib/bamm.abi";
import { elizaLogger } from "@elizaos/core";
import { getTokenAddressFromSymbol } from "../lib/symbol-to-address";

export interface BorrowParams {
	bammAddress: Address;
	borrowToken?: Address;
	borrowTokenSymbol?: string;
	amount: string;
}

export class BorrowService {
	constructor(private walletService: WalletService) {}

	async execute(params: BorrowParams): Promise<{ txHash: string }> {
		let { bammAddress, borrowToken, borrowTokenSymbol, amount } = params;

		if (!borrowToken && !borrowTokenSymbol) {
			throw new Error("Either borrowToken or borrowTokenSymbol is required");
		}
		const publicClient = this.walletService.getPublicClient();
		const walletClient = this.walletService.getWalletClient();
		const userAddress = walletClient.account.address;
		const amountInWei = BigInt(Math.floor(Number(amount) * 1e18));

		try {
			if (borrowTokenSymbol) {
				borrowToken = await getTokenAddressFromSymbol(borrowTokenSymbol);
			}
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

			let collateralToken: Address;
			let isBorrowingToken0: boolean;
			if (normalizedBorrowToken === normalizedToken0) {
				collateralToken = token1;
				isBorrowingToken0 = true;
			} else if (normalizedBorrowToken === normalizedToken1) {
				// Borrowing token1, so collateral is token0.
				collateralToken = token0;
				isBorrowingToken0 = false;
			} else {
				throw new Error(
					"borrowToken does not match token0 or token1 in the BAMM",
				);
			}

			const collateralBalance: bigint = await publicClient.readContract({
				address: collateralToken,
				abi: erc20Abi,
				functionName: "balanceOf",
				args: [userAddress],
			});
			if (collateralBalance < amountInWei) {
				throw new Error("Insufficient collateral token balance");
			}

			await this.ensureTokenApproval(collateralToken, bammAddress, amountInWei);

			const rentedMultiplier: bigint = await publicClient.readContract({
				address: bammAddress,
				abi: BAMM_ABI,
				functionName: "rentedMultiplier",
				args: [],
			});

			// Calculate rent based on borrowed amount and rentedMultiplier
			const rent = (amountInWei * rentedMultiplier) / BigInt(1e18);

			const currentTime = Math.floor(Date.now() / 1000);
			const deadline = BigInt(currentTime + 300);

			const action = {
				token0Amount: isBorrowingToken0 ? -amountInWei : 0n,
				token1Amount: isBorrowingToken0 ? 0n : -amountInWei,
				rent: rent,
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
