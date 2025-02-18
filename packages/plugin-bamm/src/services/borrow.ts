import { erc20Abi } from "viem";
import type { Address } from "viem";
import type { WalletService } from "./wallet";
import { BAMM_ABI } from "../lib/bamm.abi";

export interface BorrowParams {
	bammAddress: Address;
	borrowToken: Address;
	amount: string;
	collateralToken: Address;
}

export class BorrowService {
	constructor(private walletService: WalletService) {}

	async execute(params: BorrowParams): Promise<{ txHash: string }> {
		const { bammAddress, borrowToken, amount, collateralToken } = params;
		const publicClient = this.walletService.getPublicClient();
		const walletClient = this.walletService.getWalletClient();
		const userAddress = walletClient.account.address;
		const amountInWei = BigInt(Number(amount) * 1e18);

		const balance: bigint = await publicClient.readContract({
			address: collateralToken,
			abi: erc20Abi,
			functionName: "balanceOf",
			args: [userAddress],
		});

		if (balance < amountInWei) {
			throw new Error("Insufficient collateral token balance");
		}

		await this.ensureTokenApproval(collateralToken, bammAddress, amountInWei);

		const currentTime = Math.floor(Date.now() / 1000);
		const deadline = BigInt(currentTime + 300);

		const action = {
			token0Amount: borrowToken === collateralToken ? amountInWei : 0n,
			token1Amount: borrowToken !== collateralToken ? amountInWei : 0n,
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
