import {
	erc20Abi,
	type PublicClient,
	type WalletClient,
	type Address,
} from "viem";
import { FRAXLEND_ABI } from "../constants/abi";

export async function lend(
	pairAddress: Address,
	amount: bigint,
	publicClient: PublicClient,
	walletClient: WalletClient,
) {
	// Get asset token address
	const assetAddress = (await publicClient.readContract({
		address: pairAddress,
		abi: FRAXLEND_ABI,
		functionName: "assetContract",
	})) as Address;

	// Approve token spend
	const { request: approveRequest } = await publicClient.simulateContract({
		address: assetAddress,
		abi: erc20Abi,
		functionName: "approve",
		args: [pairAddress, amount],
	});
	await walletClient.writeContract(approveRequest);

	// Deposit into lending pool
	const { request: lendRequest } = await publicClient.simulateContract({
		address: pairAddress,
		abi: FRAXLEND_ABI,
		functionName: "addAsset",
		args: [amount, await walletClient.getAddresses()],
	});

	const hash = await walletClient.writeContract(lendRequest);
	const receipt = await publicClient.waitForTransactionReceipt({ hash });

	return {
		success: true,
		data: {
			txHash: receipt.transactionHash,
			amount,
		},
	};
}
