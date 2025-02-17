import { erc20Abi } from "viem";
import type { Address } from "viem";
import type { WalletService } from "./wallet";
import { BAMM_ABI } from "../lib/bamm.abi";

export interface LendParams {
	bammAddress: Address; // The BAMM contract address
	tokenAddress: Address; // The token to lend (e.g., an LP token)
	amount: string; // The amount to lend in normal decimal form (e.g., "10" for 10 tokens)
}

export class LendService {
	constructor(private walletService: WalletService) {}

	/**
	 * Ensures that the user has approved the spender (BAMM contract) to spend the given token.
	 */
	private async ensureTokenApproval(
		tokenAddress: Address,
		spenderAddress: Address,
		amount: bigint,
	): Promise<void> {
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

	/**
	 * Lends tokens to the BAMM contract by depositing the token and receiving BAMM tokens in return.
	 */
	async execute(params: LendParams): Promise<{ txHash: string }> {
		const { bammAddress, tokenAddress, amount } = params;
		const publicClient = this.walletService.getPublicClient();
		const walletClient = this.walletService.getWalletClient();
		const userAddress = walletClient.account.address;

		// Convert the user input amount (assumed to be in full tokens) to wei (BigInt)
		const amountInWei = BigInt(Number(amount) * 1e18);

		// Ensure the BAMM contract is approved to spend the token.
		await this.ensureTokenApproval(tokenAddress, bammAddress, amountInWei);

		// Construct the Action object for lending.
		// Here we assume that depositing tokens into the BAMM (lending) is done by calling executeActions,
		// depositing into token0 and leaving token1 and rent as zero.
		const currentTime = Math.floor(Date.now() / 1000);
		const deadline = BigInt(currentTime + 300); // 5 minutes from now

		const action = {
			token0Amount: amountInWei, // Deposit the full amount into token0 slot
			token1Amount: 0n, // No deposit for token1
			rent: 0n, // No borrowing action here
			to: userAddress, // The user receives BAMM tokens as a receipt
			token0AmountMin: amountInWei, // Expecting the full amount (you can add slippage tolerance here)
			token1AmountMin: 0n, // No token1 expected
			closePosition: false, // Not closing the position
			approveMax: false, // Not using max approval for inner transfers
			v: 0, // Dummy signature values
			r: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
			s: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
			deadline,
		};

		// Simulate and send the transaction by calling executeActions on the BAMM contract.
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
