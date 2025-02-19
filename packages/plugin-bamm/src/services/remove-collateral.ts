import type { Address } from "viem";
import type { WalletService } from "./wallet";
import { BAMM_ABI } from "../lib/bamm.abi";
import { elizaLogger } from "@elizaos/core";
import { getTokenAddressFromSymbol } from "../lib/symbol-to-address";

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
			elizaLogger.info(
				`
				token0 ${normalizedToken0}
				token1 ${normalizedToken1}
				collateral ${normalizedCollateral}
			`,
			);
			const isToken0 = normalizedCollateral === normalizedToken0;
			const isToken1 = normalizedCollateral === normalizedToken1;
			if (!isToken0 && !isToken1) {
				throw new Error(
					"Collateral token does not match token0 or token1 in the BAMM",
				);
			}

			const currentTime = Math.floor(Date.now() / 1000);
			const deadline = BigInt(currentTime + 300);

			const action = {
				token0Amount: isToken0 ? removeAmountWei : 0n,
				token1Amount: isToken1 ? removeAmountWei : 0n,
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
