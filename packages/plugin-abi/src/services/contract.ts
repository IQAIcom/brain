import { elizaLogger } from "@elizaos/core";
import type { Account, Address, PublicClient, WalletClient } from "viem";
import { WalletService } from "./wallet.js";
import { withRetry } from "../lib/helpers.js";
import type { Chain } from "viem/chains";

export class ContractService {
	private publicClient: PublicClient;
	private walletClient: WalletClient | undefined;
	private abi: any[];
	private contractAddress: `0x${string}`;
	private walletService: WalletService;

	constructor(
		abi: any[],
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
		return await withRetry(
			async () => {
				const res = await this.publicClient.readContract({
					address: this.contractAddress,
					abi: this.abi,
					functionName,
					args,
				});
				return this.formatResult(res);
			},
			{ logPrefix: `Read ${functionName}` },
		);
	}

	private formatResult(result: any) {
		// If it's a BigInt, convert to string
		if (typeof result === "bigint") {
			return result.toString();
		}

		// If it's an array, format each element
		if (Array.isArray(result)) {
			return result.map((item) => this.formatResult(item));
		}

		// If it's an object, format each property
		if (result && typeof result === "object") {
			const formatted = {};
			for (const key in result) {
				formatted[key] = this.formatResult(result[key]);
			}
			return formatted;
		}

		// Otherwise return as is
		return result;
	}

	async callWriteFunction(functionName: string, args: any[] = []) {
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
