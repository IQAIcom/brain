import { elizaLogger } from "@elizaos/core";
import type { Address } from "viem";
import { BAMM_ABI } from "../lib/bamm.abi";
import { getTokenAddressFromSymbol } from "../lib/symbol-to-address";
import { checkTokenBalance } from "../lib/token-utils";
import { validateTokenAgainstBAMM } from "../lib/token-validator";
import type { WalletService } from "./wallet";

export interface RemoveCollateralParams {
	bammAddress: Address;
	collateralToken?: Address;
	collateralTokenSymbol?: string;
	amount: string;
}

export class RemoveCollateralService {
	constructor(private walletService: WalletService) {}

	async execute(params: RemoveCollateralParams): Promise<{ txHash: string }> {
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
		const removeAmountWei = -BigInt(Math.floor(Number(amount) * 1e18));

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
			await checkTokenBalance(
				collateralToken,
				userAddress,
				removeAmountWei,
				publicClient,
			);

			const currentTime = Math.floor(Date.now() / 1000);
			const deadline = BigInt(currentTime + 300);

			const action = {
				token0Amount: tokenValidation.isToken0 ? removeAmountWei : 0n,
				token1Amount: tokenValidation.isToken1 ? removeAmountWei : 0n,
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
			elizaLogger.error("Error executing remove-collateral", error);
			throw Error("Error executing remove-collateral");
		}
	}
}
