import { erc20Abi } from "viem";
import type { Address } from "viem";
import type { WalletService } from "./wallet";
import { BAMM_ABI } from "../lib/bamm.abi";

/**
 * The user passes how much collateral (in normal units, e.g. '10' = 10 tokens) to remove from the vault.
 * We'll convert it to a negative BigInt in wei.
 */
export interface RemoveCollateralParams {
	bammAddress: Address; // The BAMM contract
	collateralToken: Address; // The token to remove (token0 or token1)
	amount: string; // e.g. "10" means 10 tokens in normal decimal
}

export class RemoveCollateralService {
	constructor(private walletService: WalletService) {}

	/**
	 * Removes collateral from the user's BAMM position by calling executeActions with negative token amounts.
	 */
	async execute(params: RemoveCollateralParams): Promise<{ txHash: string }> {
		const { bammAddress, collateralToken, amount } = params;
		const publicClient = this.walletService.getPublicClient();
		const walletClient = this.walletService.getWalletClient();
		const userAddress = walletClient.account.address;

		// Convert user input "10" => -10000000000000000000n (assuming 18 decimals)
		// negative means we're withdrawing that token from the vault
		const removeAmountWei = -BigInt(Math.floor(Number(amount) * 1e18));

		// 1. Identify if collateralToken is token0 or token1
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

		// 2. Construct the Action object.
		// Negative amount for the token we want to remove, zero for the other token.
		// rent = 0n (we're not borrowing anything),
		// to = userAddress (we receive the withdrawn tokens).
		const currentTime = Math.floor(Date.now() / 1000);
		const deadline = BigInt(currentTime + 300); // e.g. 5 minutes from now

		const action = {
			token0Amount: isToken0 ? removeAmountWei : 0n,
			token1Amount: isToken1 ? removeAmountWei : 0n,
			rent: 0n,
			to: userAddress,
			// For slippage, we can set the *AmountMin fields to 0n
			// if we just want to remove that exact token. Adjust as needed.
			token0AmountMin: 0n,
			token1AmountMin: 0n,
			closePosition: false,
			approveMax: false,
			v: 0,
			r: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
			s: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
			deadline,
		};

		// 3. Simulate and send the transaction via executeActions
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
	}
}
