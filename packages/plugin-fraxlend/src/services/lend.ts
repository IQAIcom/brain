import { type Address, erc20Abi } from "viem";
import { FRAXLEND_ABI } from "../lib/fraxlend.abi";
import type { WalletService } from "./wallet";

export class LendService {
	private walletService: WalletService;

	constructor(walletService: WalletService) {
		this.walletService = walletService;
	}

	async execute({
		pairAddress,
		amount,
	}: { pairAddress: Address; amount: bigint }) {
		const publicClient = this.walletService.getPublicClient();
		const walletClient = this.walletService.getWalletClient();
		const userAddress = await walletClient.getAddresses();

		const assetAddress = (await publicClient.readContract({
			address: pairAddress,
			abi: FRAXLEND_ABI,
			functionName: "asset",
		})) as Address;

		const balance = await publicClient.readContract({
			address: assetAddress,
			abi: erc20Abi,
			functionName: "balanceOf",
			args: [userAddress[0]],
		});

		if (balance < amount) {
			throw new Error(
				`Insufficient balance. Available: ${balance}, Requested: ${amount}`,
			);
		}

		const { request: approveRequest } = await publicClient.simulateContract({
			address: assetAddress,
			abi: erc20Abi,
			functionName: "approve",
			args: [pairAddress, amount],
		});
		await walletClient.writeContract(approveRequest);

		const { request: lendRequest } = await publicClient.simulateContract({
			address: pairAddress,
			abi: FRAXLEND_ABI,
			functionName: "deposit",
			args: [amount, await walletClient.getAddresses()[0]],
		});

		const hash = await walletClient.writeContract(lendRequest);
		const receipt = await publicClient.waitForTransactionReceipt({ hash });

		return {
			txHash: receipt.transactionHash,
			amount,
		};
	}
}
