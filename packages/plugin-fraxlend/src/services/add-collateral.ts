import { type Address, erc20Abi } from "viem";
import { FRAXLEND_ABI } from "../lib/fraxlend.abi";
import type { WalletService } from "./wallet";

export class AddCollateralService {
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

		const collateralAddress = (await publicClient.readContract({
			address: pairAddress,
			abi: FRAXLEND_ABI,
			functionName: "collateralContract",
		})) as Address;

		const { request: approveRequest } = await publicClient.simulateContract({
			address: collateralAddress,
			abi: erc20Abi,
			functionName: "approve",
			args: [pairAddress, amount],
		});
		await walletClient.writeContract(approveRequest);

		const { request } = await publicClient.simulateContract({
			address: pairAddress,
			abi: FRAXLEND_ABI,
			functionName: "addCollateral",
			args: [amount, await walletClient.getAddresses()],
		});

		const hash = await walletClient.writeContract(request);
		const receipt = await publicClient.waitForTransactionReceipt({ hash });

		return {
			success: true,
			data: {
				txHash: receipt.transactionHash,
				amount,
			},
		};
	}
}
