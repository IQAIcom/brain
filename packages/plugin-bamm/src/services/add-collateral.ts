import { erc20Abi } from "viem";
import type { Address } from "viem";
import type { WalletService } from "./wallet";
import { BAMM_ABI } from "../lib/bamm.abi";
import dedent from "dedent";
import { elizaLogger } from "@elizaos/core";

export interface AddCollateralParams {
	bammAddress: Address;
	collateralToken: Address;
	amount: string; // e.g. "10" means 10 tokens in normal decimal
}

export class AddCollateralService {
	constructor(private walletService: WalletService) {}

	/**
	 * Adds collateral to a BAMM position by depositing collateralToken via executeActions.
	 * Automatically detects if the token is token0 or token1.
	 */
	async execute(params: AddCollateralParams): Promise<{ txHash: string }> {
		const { bammAddress, collateralToken, amount } = params;
		const publicClient = this.walletService.getPublicClient();
		const walletClient = this.walletService.getWalletClient();
		const userAddress = walletClient.account.address;

		const amountInWei = BigInt(Number(amount) * 1e18);

		await this.ensureTokenApproval(collateralToken, userAddress, amountInWei);

		const token0Address: Address = await publicClient.readContract({
			address: bammAddress,
			abi: BAMM_ABI,
			functionName: "token0",
			args: [],
		});
		const token1Address: Address = await publicClient.readContract({
			address: bammAddress,
			abi: BAMM_ABI,
			functionName: "token1",
			args: [],
		});
		const normalizedCollateral = collateralToken.toLowerCase();
		const normalizedToken0 = token0Address.toLowerCase();
		const normalizedToken1 = token1Address.toLowerCase();

		const isToken0 = normalizedCollateral === normalizedToken0;
		const isToken1 = normalizedCollateral === normalizedToken1;

		if (!isToken0 && !isToken1) {
			throw new Error(
				"Collateral token does not match token0 or token1 in the BAMM",
			);
		}

		const currentTime = Math.floor(Date.now() / 1000);
		const deadline = BigInt(currentTime + 300); // 5 minutes from now

		const action = {
			token0Amount: isToken0 ? amountInWei : 0n,
			token1Amount: isToken1 ? amountInWei : 0n,
			rent: 0n,
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
		try {
			const { request: executeRequest } = await publicClient.simulateContract({
				address: bammAddress,
				abi: BAMM_ABI,
				functionName: "executeActions",
				args: [action],
				account: walletClient.account,
				// nonce: nonce,
			});
			const txHash = await walletClient.writeContract(executeRequest);
			await publicClient.waitForTransactionReceipt({ hash: txHash });
			return { txHash };
		} catch (error) {
			elizaLogger.error("Error in add collateral service:", error);
			throw error;
		}
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
