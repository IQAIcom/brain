import type { Address, PublicClient, WalletClient } from "viem";
import { FRAXLEND_ABI } from "../constants/abi";

export async function withdraw(
	pairAddress: Address,
	shares: bigint,
	publicClient: PublicClient,
	walletClient: WalletClient,
) {
	const { request } = await publicClient.simulateContract({
		address: pairAddress,
		abi: FRAXLEND_ABI,
		functionName: "removeAsset",
		args: [shares, await walletClient.getAddresses()],
	});

	const hash = await walletClient.writeContract(request);
	const receipt = await publicClient.waitForTransactionReceipt({ hash });

	return {
		success: true,
		data: {
			txHash: receipt.transactionHash,
			shares,
		},
	};
}
