import dedent from "dedent";
import { type Address, type Hash, erc20Abi } from "viem";
import { getContract } from "viem";
import type { AssembleResponseTxn } from "./assemble";
import type { WalletService } from "./wallet";

export class ExecuteSwapService {
	private readonly NATIVE_TOKEN = "0x0000000000000000000000000000000000000000";
	private readonly walletService: WalletService;

	constructor(walletService: WalletService) {
		this.walletService = walletService;
	}

	private requiresAllowance(tokenAddress: string): boolean {
		return tokenAddress.toLowerCase() !== this.NATIVE_TOKEN.toLowerCase();
	}

	async checkAndSetAllowance(
		tokenAddress: string,
		amount: bigint,
		spenderAddress: string,
	): Promise<boolean> {
		if (!this.requiresAllowance(tokenAddress)) {
			return true;
		}

		const walletClient = this.walletService.getWalletClient();
		const publicClient = this.walletService.getPublicClient();

		if (!walletClient?.account) {
			throw new Error("Wallet client is not defined");
		}

		try {
			const currentAllowance = await publicClient.readContract({
				address: tokenAddress as Address,
				abi: erc20Abi,
				functionName: "allowance",
				args: [walletClient.account.address, spenderAddress as Address],
			});

			if (currentAllowance >= amount) {
				return true;
			}

			const { request } = await publicClient.simulateContract({
				address: tokenAddress as Address,
				abi: erc20Abi,
				functionName: "approve",
				args: [spenderAddress as Address, amount],
				account: walletClient.account,
			});

			const hash = await walletClient.writeContract(request);
			const receipt = await publicClient.waitForTransactionReceipt({ hash });

			return receipt.status === "success";
		} catch (error) {
			console.error("Error in allowance check/set:", error);
			throw error;
		}
	}

	async execute(txn: AssembleResponseTxn): Promise<Hash> {
		const walletClient = this.walletService.getWalletClient();
		const publicClient = this.walletService.getPublicClient();
		if (!walletClient?.account || !publicClient) {
			throw new Error("Wallet client is not defined");
		}

		try {
			// Get the latest nonce
			const nonce = await publicClient.getTransactionCount({
				address: walletClient.account.address,
			});

			const hash = await walletClient.sendTransaction({
				to: txn.to as Address,
				data: txn.data as `0x${string}`,
				value: BigInt(txn.value || "0"),
				gas: BigInt(txn.gas),
				gasPrice: BigInt(txn.gasPrice),
				nonce, // Use the latest nonce
				account: walletClient.account,
				chain: walletClient.chain,
			});

			return hash;
		} catch (error) {
			console.error("Error executing swap:", error);
			throw error;
		}
	}

	async formatWithConfirmation(txn: AssembleResponseTxn, hash: Hash) {
		const publicClient = this.walletService.getPublicClient();
		const receipt = await publicClient.waitForTransactionReceipt({ hash });

		const gasCostInEth =
			(receipt.gasUsed * receipt.effectiveGasPrice) / BigInt(10 ** 18);

		const formattedSwap = dedent`
            💫 Swap Transaction
            - Status: ${receipt.status === "success" ? "✅ Confirmed" : "❌ Failed"}
            - Transaction Hash: ${hash}
            - Block: ${receipt.blockNumber}
            - From: ${txn.from}
            - To: ${txn.to}
            - Gas Cost: ${gasCostInEth.toString()}
            - Chain: ${publicClient?.chain?.name || "Unknown"}
        `;

		return formattedSwap;
	}
}
