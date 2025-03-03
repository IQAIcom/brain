import {
	createPublicClient,
	createWalletClient,
	http,
	type Address,
	type Hash,
	parseEther,
	formatEther,
	decodeAbiParameters,
	parseAbiParameters,
	type Log,
	type PublicClient,
	type WalletClient,
} from "viem";
import { WalletService } from "./wallet";
import { mainnet, fraxtal } from "viem/chains";
import { elizaLogger } from "@elizaos/core";
import {
	BRIDGE_ADDRESS,
	IQ_ADDRESSES,
	BRIDGE_EVENT_ABI,
	DEPOSIT_ERC20_METHOD_ID,
	FUNDING_AMOUNT,
	MIN_IQ_THRESHOLD,
} from "../lib/constants";

export class BridgeMonitorService {
	private iqAddresses: {
		ethereum: Address;
		fraxtal: Address;
	};
	private fundingAmount: bigint;
	private minIQThreshold: bigint;
	private bridgeAddress: Address;
	private isMonitoring = false;
	private walletService: WalletService;

	constructor(funderPrivateKey: string) {
		this.fundingAmount = FUNDING_AMOUNT;
		this.minIQThreshold = MIN_IQ_THRESHOLD;
		this.bridgeAddress = BRIDGE_ADDRESS as Address;
		this.walletService = new WalletService(funderPrivateKey, fraxtal);

		elizaLogger.info(`IQ Bridge Monitor initialized with:
            - Bridge address: ${this.bridgeAddress}
            - IQ token (L1): ${IQ_ADDRESSES.ethereum}
            - IQ token (L2): ${IQ_ADDRESSES.fraxtal}
            - Funding amount: ${formatEther(this.fundingAmount)} ETH
            - Min IQ threshold: ${formatEther(this.minIQThreshold)} IQ`);
	}

	async startMonitoring(): Promise<void> {
		if (this.isMonitoring) {
			return;
		}

		this.isMonitoring = true;

		// Check the funding account balance first
		const funderBalance = await this.fraxtalClient.getBalance({
			address: this.fraxtalWallet.account.address,
		});

		elizaLogger.info(
			`Bridge monitor started. Funder balance: ${formatEther(funderBalance)} ETH`,
		);

		// Monitor for ERC20DepositInitiated events
		this.ethClient.watchContractEvent({
			address: this.bridgeAddress,
			abi: BRIDGE_EVENT_ABI,
			eventName: "ERC20DepositInitiated",
			onLogs: async (logs: Log[]) => {
				for (const log of logs) {
					try {
						// Extract parameters from the event
						const l1Token = log.args.l1Token as Address;
						const from = log.args.from as Address;
						const to = log.args.to as Address;
						const amount = log.args.amount as bigint;

						// Skip if not IQ token
						if (
							l1Token.toLowerCase() !== this.iqAddresses.ethereum.toLowerCase()
						) {
							continue;
						}

						elizaLogger.info(`Detected IQ bridge deposit:
- From: ${from}
- To: ${to}
- Amount: ${formatEther(amount)} IQ
- Transaction: ${log.transactionHash}`);

						// Only process transactions above the threshold
						if (amount >= this.minIQThreshold) {
							// We use the "to" address for funding (where tokens will arrive on L2)
							// If "to" is not specified (zero address), use the "from" address
							const recipientAddress =
								to === "0x0000000000000000000000000000000000000000" ? from : to;
							await this.processBridgeTransaction(recipientAddress, amount);
						} else {
							elizaLogger.info(
								`Skipping funding: Amount ${formatEther(amount)} IQ is below threshold of ${formatEther(this.minIQThreshold)} IQ`,
							);
						}
					} catch (error) {
						elizaLogger.error(`Error processing event log: ${error.message}`);
					}
				}
			},
		});

		// Also watch for transactions to the bridge directly
		this.ethClient.watchContractEvent({
			address: this.bridgeAddress,
			abi: [], // Empty ABI for raw transactions
			onLogs: async (logs) => {
				for (const log of logs) {
					try {
						const transaction = await this.ethClient.getTransaction({
							hash: log.transactionHash,
						});

						// Skip if not a transaction to the bridge
						if (
							transaction.to?.toLowerCase() !== this.bridgeAddress.toLowerCase()
						) {
							continue;
						}

						// Check if it's a depositERC20 call
						if (transaction.input.startsWith(`0x${DEPOSIT_ERC20_METHOD_ID}`)) {
							// Decode the input data
							const inputData = transaction.input.slice(10); // Remove the method ID

							const parameters = decodeAbiParameters(
								parseAbiParameters(
									"address l1Token, address l2Token, uint256 amount, uint32 minGasLimit, bytes extraData",
								),
								`0x${inputData}`,
							);

							const [l1Token, l2Token, amount] = parameters;

							// Skip if not IQ token
							if (
								(l1Token as Address).toLowerCase() !==
								this.iqAddresses.ethereum.toLowerCase()
							) {
								continue;
							}

							elizaLogger.info(`Detected depositERC20 for IQ:
- From: ${transaction.from}
- Amount: ${formatEther(amount as bigint)} IQ
- Transaction: ${transaction.hash}`);

							// Only process transactions above the threshold
							if ((amount as bigint) >= this.minIQThreshold) {
								await this.processBridgeTransaction(
									transaction.from,
									amount as bigint,
								);
							} else {
								elizaLogger.info(
									`Skipping funding: Amount ${formatEther(amount as bigint)} IQ is below threshold of ${formatEther(this.minIQThreshold)} IQ`,
								);
							}
						}
					} catch (error) {
						elizaLogger.error(`Error processing transaction: ${error.message}`);
					}
				}
			},
		});

		elizaLogger.info(
			"Bridge monitoring active for both ERC20DepositInitiated events and depositERC20 function calls",
		);
	}

	private async processBridgeTransaction(
		userAddress: string,
		amount: bigint,
	): Promise<void> {
		try {
			elizaLogger.info(
				`Processing bridge transaction for ${userAddress} with ${formatEther(amount)} IQ`,
			);

			// Check if the user has ETH on Fraxtal already
			const ethBalance = await this.fraxtalClient.getBalance({
				address: userAddress as Address,
			});

			elizaLogger.info(
				`User ${userAddress} has ${formatEther(ethBalance)} ETH on Fraxtal`,
			);

			// If they don't have enough ETH, fund them
			if (ethBalance < parseEther("0.0001")) {
				await this.fundUserAddress(userAddress);
			} else {
				elizaLogger.info(
					`User ${userAddress} already has sufficient ETH on Fraxtal. No funding needed.`,
				);
			}
		} catch (error) {
			elizaLogger.error(
				`Error processing bridge transaction: ${error.message}`,
			);
		}
	}

	private async fundUserAddress(userAddress: string): Promise<void> {
		try {
			// Check funder balance
			const funderBalance = await this.fraxtalClient.getBalance({
				address: this.fraxtalWallet.account.address,
			});

			// Make sure we have enough funds
			if (funderBalance < this.fundingAmount) {
				elizaLogger.error(
					`Funding wallet balance too low: ${formatEther(funderBalance)} ETH. Skipping funding.`,
				);
				return;
			}

			// Send ETH to the user
			const hash = await this.fraxtalWallet.sendTransaction({
				to: userAddress as Address,
				value: this.fundingAmount,
				chain: fraxtal,
			});

			elizaLogger.info(`Funding transaction initiated: ${hash}`);

			// Wait for confirmation
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
			elizaLogger.error(`Error funding user address: ${error.message}`);
		}
	}
}
