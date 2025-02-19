import { erc20Abi } from "viem";
import type { Address } from "viem";
import type { WalletService } from "./wallet";
import { BAMM_ABI } from "../lib/bamm.abi";
import { elizaLogger } from "@elizaos/core";
import { getTokenAddressFromSymbol } from "../lib/symbol-to-address";
import { validateTokenAgainstBAMM } from "../lib/token-validator";

export interface AddCollateralParams {
	bammAddress: Address;
	collateralToken?: Address;
	collateralTokenSymbol?: string;
	amount: string;
}

export class AddCollateralService {
	constructor(private walletService: WalletService) {}

	async execute(params: AddCollateralParams): Promise<{ txHash: string }> {
		let { bammAddress, collateralToken, collateralTokenSymbol, amount } =
			params;
		if (!collateralToken && !collateralTokenSymbol) {
			throw new Error(
				"Either collateralToken or collateralTokenSymbol is required",
			);
		}
		const publicClient = this.walletService.getPublicClient();
		const walletClient = this.walletService.getWalletClient();
		const userAddress = walletClient.account.address;
		const amountInWei = BigInt(Number(amount) * 1e18);
		try {
			if (collateralTokenSymbol) {
				collateralToken = await getTokenAddressFromSymbol(
					collateralTokenSymbol,
				);
			}
			const tokenValidation = await validateTokenAgainstBAMM(
				bammAddress,
				collateralToken,
				publicClient,
			);

			await this.ensureTokenApproval(collateralToken, bammAddress, amountInWei);

			const currentTime = Math.floor(Date.now() / 1000);
			const deadline = BigInt(currentTime + 300);

			const action = {
				token0Amount: tokenValidation.isToken0 ? amountInWei : 0n,
				token1Amount: tokenValidation.isToken1 ? amountInWei : 0n,
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
			elizaLogger.error("Error in add collateral service:", error);
			throw Error("Error in add collateral service");
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
