import { elizaLogger } from "@elizaos/core";
import type { Abi, PublicClient, WalletClient } from "viem";
import { WalletService } from "./wallet.js";
import { withRetry, formatResult } from "../lib/helpers.js";
import type { Chain } from "viem/chains";

export class ContractService {
	private publicClient: PublicClient;
	private walletClient: WalletClient | undefined;
	private abi: Abi;
	private contractAddress: `0x${string}`;
	private walletService: WalletService;

	constructor(
		abi: Abi,
		contractAddress: `0x${string}`,
		privateKey: string,
		chain: Chain,
	) {
		this.abi = abi;
		this.contractAddress = contractAddress;

		this.walletService = new WalletService(privateKey, chain);
		this.publicClient = this.walletService.getPublicClient();
		this.walletClient = this.walletService.getWalletClient();

		if (!this.walletClient) {
			throw new Error(
				"Failed to initialize wallet client. Please check your private key.",
			);
		}

		elizaLogger.info(`Contract service initialized for ${contractAddress}`);
	}

	async callReadFunction(functionName: string, args: any[] = []) {
		console.log("Calling read function:", functionName, args);
		return await withRetry(
			async () => {
				const res = await this.publicClient.readContract({
					address: this.contractAddress,
					abi: this.abi,
					functionName,
					args,
				});
				return formatResult(res);
			},
			{ logPrefix: `Read ${functionName}` },
		);
	}

	async callWriteFunction(functionName: string, args: any[] = []) {
		console.log("Calling write function:", functionName, args);
		if (!this.walletClient || !this.walletClient.account) {
			throw new Error("Wallet client not initialized.");
		}

		return await withRetry(
			async () => {
				const hash = await this.walletClient?.writeContract({
					address: this.contractAddress,
					abi: this.abi,
					functionName,
					args,
					account: this.walletClient.account ?? null,
					chain: this.walletClient.chain,
				});
				if (!hash) {
					throw new Error("Transaction hash is undefined.");
				}

				const receipt = await this.publicClient.waitForTransactionReceipt({
					hash,
				});

				return { hash, receipt };
			},
			{ logPrefix: `Write ${functionName}` },
		);
	}
}
