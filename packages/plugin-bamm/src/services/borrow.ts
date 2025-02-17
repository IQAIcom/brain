import { erc20Abi } from "viem";
import type { Address } from "viem";
import type { WalletService } from "./wallet";
import { BAMM_ABI } from "../lib/bamm.abi";

/**
 * The user specifies how much collateral to borrow, and the service handles
 * calling the executeActions function to make the borrow transaction.
 */
export interface BorrowParams {
	bammAddress: Address; // The BAMM contract address
	borrowToken: Address; // The token the user wants to borrow (e.g., token0 or token1)
	amount: string; // Amount the user wants to borrow in human-readable form
	collateralToken: Address; // The token being used as collateral
}

export class BorrowService {
	constructor(private walletService: WalletService) {}

	/**
	 * Borrows collateral using the executeActions function on the BAMM contract.
	 */
	async execute(params: BorrowParams): Promise<{ txHash: string }> {
		const { bammAddress, borrowToken, amount, collateralToken } = params;
		const publicClient = this.walletService.getPublicClient();
		const walletClient = this.walletService.getWalletClient();
		const userAddress = walletClient.account.address;
		const amountInWei = BigInt(Number(amount) * 1e18);

		// 1. Check collateral token balance (you should have enough collateral to borrow)
		const balance: bigint = await publicClient.readContract({
			address: collateralToken,
			abi: erc20Abi,
			functionName: "balanceOf",
			args: [userAddress],
		});

		if (balance < amountInWei) {
			throw new Error("Insufficient collateral token balance");
		}

		// 2. Ensure token approval for BAMM contract to spend the collateral token
		await this.ensureTokenApproval(collateralToken, bammAddress, amountInWei);

		// 3. Construct the Action object for borrowing tokens
		const currentTime = Math.floor(Date.now() / 1000);
		const deadline = BigInt(currentTime + 300); // e.g., 5 minutes from now

		const action = {
			token0Amount: borrowToken === collateralToken ? amountInWei : 0n, // borrow token
			token1Amount: borrowToken !== collateralToken ? amountInWei : 0n, // borrow token
			rent: amountInWei, // rent the borrow token
			to: userAddress, // borrower receives the tokens
			token0AmountMin: 0n, // no slippage allowed (you can adjust this as needed)
			token1AmountMin: 0n, // no slippage allowed
			closePosition: false, // not closing position here
			approveMax: false, // not using max approval
			v: 0, // Dummy signature values (set to 0)
			r: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
			s: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
			deadline,
		};

		// 4. Call executeActions to perform the borrowing operation
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

	/**
	 * Ensure that the token approval is set for the collateral token.
	 */
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
