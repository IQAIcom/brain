import { type Address, erc20Abi } from "viem";
import type { PublicClient, WalletClient } from "viem";

export async function ensureTokenApproval(
	tokenAddress: Address,
	spenderAddress: Address,
	amount: bigint,
	publicClient: PublicClient,
	walletClient: WalletClient,
) {
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

export async function checkTokenBalance(
	tokenAddress: Address,
	userAddress: Address,
	amount: bigint,
	publicClient: PublicClient,
) {
	const balance: bigint = await publicClient.readContract({
		address: tokenAddress,
		abi: erc20Abi,
		functionName: "balanceOf",
		args: [userAddress],
	});

	if (balance < amount) {
		throw new Error("Insufficient token balance");
	}

	return balance;
}
