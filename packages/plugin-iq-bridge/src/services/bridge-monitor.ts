import {
	type Address,
	formatEther,
	type PublicClient,
	type WalletClient,
} from "viem";
import { WalletService } from "./wallet";
import { fraxtal } from "viem/chains";
import { elizaLogger } from "@elizaos/core";
import {
	BRIDGE_ADDRESS,
	IQ_ADDRESSES,
	BRIDGE_EVENT_ABI,
	FUNDING_AMOUNT,
	MIN_IQ_THRESHOLD,
} from "../lib/constants";

export class BridgeMonitorService {
	private ethClient: PublicClient;
	private fraxtalClient: PublicClient;
	private walletClient: WalletClient | undefined;
	private iqAddresses = IQ_ADDRESSES;
	private fundingAmount: bigint = FUNDING_AMOUNT;
	private minIQThreshold: bigint = MIN_IQ_THRESHOLD;
	private bridgeAddress: Address = BRIDGE_ADDRESS as Address;
	private isMonitoring = false;
	private walletService: WalletService;

	constructor(funderPrivateKey: string) {
		this.walletService = new WalletService(funderPrivateKey);

		this.ethClient = this.walletService.getEthClient();
		this.fraxtalClient = this.walletService.getFraxtalClient();
		this.walletClient = this.walletService.getWalletClient();

		if (!this.walletClient) {
			throw new Error(
				"Failed to initialize wallet client. Please check your private key.",
			);
		}

		elizaLogger.info(`IQ Bridge Monitor initialized with:
- Bridge address: ${this.bridgeAddress}
- IQ token (L1): ${this.iqAddresses.ethereum}
- IQ token (L2): ${this.iqAddresses.fraxtal}
- Funding amount: ${formatEther(this.fundingAmount)} ETH
- Min IQ threshold: ${formatEther(this.minIQThreshold)} IQ`);
	}

	async startMonitoring() {
		if (this.isMonitoring) {
			return;
		}

		this.isMonitoring = true;

		if (!this.walletClient || !this.walletClient.account) {
			throw new Error(
				"Wallet client not initialized. Cannot start monitoring.",
			);
		}

		const funderBalance = await this.fraxtalClient.getBalance({
			address: this.walletClient.account.address,
		});

		elizaLogger.info(
			`Bridge monitor started. Funder balance: ${formatEther(funderBalance)} ETH`,
		);

		this.ethClient.watchContractEvent({
			address: this.bridgeAddress,
			abi: BRIDGE_EVENT_ABI,
			args: { localToken: this.iqAddresses.ethereum },
			eventName: "ERC20BridgeInitiated",
			onLogs: async (logs) => {
				for (const log of logs) {
					try {
						const l1Token = log.args.localToken as Address;
						const from = log.args.from as Address;
						const to = log.args.to as Address;
						const amount = log.args.amount as bigint;

						elizaLogger.info(`Detected IQ bridge deposit:
- From: ${from}
- Token: ${l1Token}
- Amount: ${formatEther(amount)} IQ
- Transaction: ${log.transactionHash}`);

						if (amount >= this.minIQThreshold) {
							const recipientAddress =
								to === "0x0000000000000000000000000000000000000000" ? from : to;
							await this.processBridgeTransaction(recipientAddress, amount);
						} else {
							elizaLogger.info(
								`Skipping funding: Amount ${formatEther(amount)} IQ is below threshold of ${formatEther(this.minIQThreshold)} IQ`,
							);
						}
					} catch (error) {
						elizaLogger.error(
							`Error processing event log: ${(error as Error).message}`,
						);
					}
				}
			},
		});

		elizaLogger.info(
			"Bridge monitoring active for ERC20DepositInitiated events",
		);
	}

	private async processBridgeTransaction(userAddress: string, amount: bigint) {
		try {
			elizaLogger.info(
				`Processing bridge transaction for ${userAddress} with ${formatEther(amount)} IQ`,
			);

			const ethBalance = await this.fraxtalClient.getBalance({
				address: userAddress as Address,
			});

			elizaLogger.info(
				`User ${userAddress} has ${formatEther(ethBalance)} ETH on Fraxtal`,
			);

			if (ethBalance < this.minIQThreshold) {
				await this.fundUserAddress(userAddress);
			} else {
				elizaLogger.info(
					`User ${userAddress} already has sufficient ETH on Fraxtal. No funding needed.`,
				);
			}
		} catch (error) {
			elizaLogger.error(
				`Error processing bridge transaction: ${(error as Error).message}`,
			);
		}
	}

	private async fundUserAddress(userAddress: string) {
		try {
			if (!this.walletClient || !this.walletClient.account) {
				throw new Error("Wallet client not initialized. Cannot fund address.");
			}

			const funderBalance = await this.fraxtalClient.getBalance({
				address: this.walletClient.account.address,
			});

			if (funderBalance < this.fundingAmount) {
				elizaLogger.error(
					`Funding wallet balance too low: ${formatEther(funderBalance)} ETH. Skipping funding.`,
				);
				return;
			}

			const hash = await this.walletClient.sendTransaction({
				to: userAddress as Address,
				value: this.fundingAmount,
				chain: fraxtal,
				account: this.walletClient.account,
			});

			elizaLogger.info(`Funding transaction initiated: ${hash}`);

			const receipt = await this.fraxtalClient.waitForTransactionReceipt({
				hash,
			});

			if (receipt.status === "success") {
				elizaLogger.info(
					`Successfully funded ${userAddress} with ${formatEther(this.fundingAmount)} ETH on Fraxtal (tx: ${hash})`,
				);
			} else {
				elizaLogger.error(`Funding transaction failed: ${hash}`);
			}
		} catch (error) {
			elizaLogger.error(
				`Error funding user address: ${(error as Error).message}`,
			);
		}
	}
}
