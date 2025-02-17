import { erc20Abi } from "viem";
import type { Address } from "viem";
import type { WalletService } from "./wallet";
import { BAMM_ABI } from "../lib/bamm.abi";

/**
 * The user specifies how much they want to repay for their borrowed collateral,
 * and the service calls the executeActions function to handle the repayment transaction.
 */
export interface RepayParams {
	bammAddress: Address; // The BAMM contract address
	borrowToken: Address; // The token the user borrowed (e.g., token0 or token1)
	amount: string; // Amount the user wants to repay in human-readable form
	collateralToken: Address; // The token being used as collateral
}

export class RepayService {
	constructor(private walletService: WalletService) {}

	/**
	 * Repays the borrowed amount by interacting with the BAMM contract.
	 */
	async execute(params: RepayParams): Promise<{ txHash: string }> {
		const { bammAddress, borrowToken, amount, collateralToken } = params;
		const publicClient = this.walletService.getPublicClient();
		const walletClient = this.walletService.getWalletClient();
		const userAddress = walletClient.account.address;
		const amountInWei = BigInt(Number(amount) * 1e18);

		// 1. Check if the user has enough balance of the borrow token to repay
		const balance: bigint = await publicClient.readContract({
			address: borrowToken,
			abi: erc20Abi,
			functionName: "balanceOf",
			args: [userAddress],
		});

		if (balance < amountInWei) {
			throw new Error("Insufficient balance of borrow token to repay");
		}

		// 2. Ensure token approval for BAMM contract to spend the borrow token
		await this.ensureTokenApproval(borrowToken, bammAddress, amountInWei);

		// 3. Construct the Action object for repaying the borrowed tokens
		const currentTime = Math.floor(Date.now() / 1000);
		const deadline = BigInt(currentTime + 300); // e.g., 5 minutes from now

		const action = {
			token0Amount: borrowToken === collateralToken ? 0n : -amountInWei, // repay token (negative value)
			token1Amount: borrowToken !== collateralToken ? -amountInWei : 0n, // repay token (negative value)
			rent: -amountInWei, // repayment of the borrowed amount
			to: userAddress, // the user receives their returned tokens
			token0AmountMin: 0n, // no slippage allowed (you can adjust this as needed)
			token1AmountMin: 0n, // no slippage allowed
			closePosition: false, // not closing position here
			approveMax: false, // not using max approval
			v: 0, // Dummy signature values (set to 0)
			r: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
			s: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
			deadline,
		};

		// 4. Call executeActions to perform the repayment
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
	 * Ensure that the token approval is set for the borrow token.
	 */
	private async ensureTokenApproval(
		borrowAddress: Address,
		spenderAddress: Address,
		amount: bigint,
	) {
		const publicClient = this.walletService.getPublicClient();
		const walletClient = this.walletService.getWalletClient();
		const userAddress = walletClient.account.address;

		const currentAllowance = await publicClient.readContract({
			address: borrowAddress,
			abi: erc20Abi,
			functionName: "allowance",
			args: [userAddress, spenderAddress],
		});

		if (currentAllowance < amount) {
			const { request: approveRequest } = await publicClient.simulateContract({
				address: borrowAddress,
				abi: erc20Abi,
				functionName: "approve",
				args: [spenderAddress, amount],
				account: walletClient.account,
			});
			await walletClient.writeContract(approveRequest);
		}
	}
}
