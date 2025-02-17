import type { WalletService } from "./wallet";
import { BAMM_ADDRESSES } from "../constants";
import { BAMM_FACTORY_ABI } from "../lib/bamm-factory.abi";
import { BAMM_ABI } from "../lib/bamm.abi"; // your BAMM contract ABI
import { erc20Abi } from "viem";
import type { Address } from "viem";

export class LendService {
	private walletService: WalletService;

	constructor(walletService: WalletService) {
		this.walletService = walletService;
	}

	async execute({
		pairAddress,
		amount,
	}: {
		pairAddress: Address;
		amount: bigint;
	}) {
		const publicClient = this.walletService.getPublicClient();
		const walletClient = this.walletService.getWalletClient();
		const userAddress = walletClient.account.address;

		// 1. Check LP token balance
		const lpBalance: bigint = await publicClient.readContract({
			address: pairAddress,
			abi: erc20Abi,
			functionName: "balanceOf",
			args: [userAddress],
		});

		if (lpBalance < amount) {
			throw new Error("Insufficient LP token balance");
		}

		// 2. Get the BAMM address for the pair using the BAMM factory
		let bamm: Address = await publicClient.readContract({
			address: BAMM_ADDRESSES.FACTORY,
			abi: BAMM_FACTORY_ABI,
			functionName: "pairToBamm",
			args: [pairAddress],
		});

		// If no BAMM exists, create one
		if (bamm === "0x0000000000000000000000000000000000000000") {
			const { request: createBammRequest } =
				await publicClient.simulateContract({
					address: BAMM_ADDRESSES.FACTORY,
					abi: BAMM_FACTORY_ABI,
					functionName: "createBamm",
					args: [pairAddress],
					account: walletClient.account,
				});
			const createTx = await walletClient.writeContract(createBammRequest);
			await publicClient.waitForTransactionReceipt({ hash: createTx });
			// Re-read the BAMM address after creation
			bamm = await publicClient.readContract({
				address: BAMM_ADDRESSES.FACTORY,
				abi: BAMM_FACTORY_ABI,
				functionName: "pairToBamm",
				args: [pairAddress],
			});
		}

		// 3. Approve the BAMM contract to spend your LP tokens
		const { request: approveRequest } = await publicClient.simulateContract({
			address: pairAddress,
			abi: erc20Abi,
			functionName: "approve",
			args: [bamm, amount],
			account: walletClient.account,
		});
		await walletClient.writeContract(approveRequest);

		// 4. Call the mint function on the BAMM contract to lend your tokens
		// This deposits your LP tokens into the BAMM and mints BAMM tokens in return.
		const { request: mintRequest } = await publicClient.simulateContract({
			address: bamm,
			abi: BAMM_ABI,
			functionName: "mint",
			args: [userAddress, amount],
			account: walletClient.account,
		});
		const mintTx = await walletClient.writeContract(mintRequest);
		const receipt = await publicClient.waitForTransactionReceipt({
			hash: mintTx,
		});

		return {
			txHash: receipt.transactionHash,
			amount,
		};
	}
}
