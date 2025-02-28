import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ExecuteSwapService } from "../../services/execute-swap";

const walletClientMock = {
	account: { address: "0xUserAddress" },
	sendTransaction: vi.fn(),
	writeContract: vi.fn(),
	chain: { name: "Ethereum" },
};

const publicClientMock = {
	readContract: vi.fn(),
	simulateContract: vi.fn(),
	waitForTransactionReceipt: vi.fn(),
	getTransactionCount: vi.fn(),
};

const walletServiceMock = {
	getWalletClient: vi.fn(() => walletClientMock),
	getPublicClient: vi.fn(() => publicClientMock),
};

describe("ExecuteSwapService", () => {
	let executeSwapService: ExecuteSwapService;

	beforeEach(() => {
		executeSwapService = new ExecuteSwapService(walletServiceMock as any);
		vi.restoreAllMocks();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe("checkAndSetAllowance", () => {
		it("should return true if token does not require approval", async () => {
			const result = await executeSwapService.checkAndSetAllowance(
				"0x0000000000000000000000000000000000000000",
				100n,
				"0xSpender",
			);
			expect(result).toBe(true);
		});

		it("should return true if existing allowance is sufficient", async () => {
			publicClientMock.readContract.mockResolvedValue(200n);

			const result = await executeSwapService.checkAndSetAllowance(
				"0xTokenAddress",
				100n,
				"0xSpender",
			);

			expect(result).toBe(true);
			expect(publicClientMock.readContract).toHaveBeenCalled();
		});

		it("should set allowance if not sufficient", async () => {
			publicClientMock.readContract.mockResolvedValue(50n);
			publicClientMock.simulateContract.mockResolvedValue({
				request: "approveRequest",
			});
			walletClientMock.writeContract.mockResolvedValue("0xTxHash");
			publicClientMock.waitForTransactionReceipt.mockResolvedValue({
				status: "success",
			});

			const result = await executeSwapService.checkAndSetAllowance(
				"0xTokenAddress",
				100n,
				"0xSpender",
			);

			expect(result).toBe(true);
			expect(walletClientMock.writeContract).toHaveBeenCalledWith(
				"approveRequest",
			);
		});

		it("should throw an error if wallet client is missing", async () => {
			walletServiceMock.getWalletClient.mockReturnValue(null);

			await expect(
				executeSwapService.checkAndSetAllowance("0xToken", 100n, "0xSpender"),
			).rejects.toThrow("Wallet client is not defined");
		});
	});

	describe("execute", () => {
		it("should send a transaction successfully", async () => {
			publicClientMock.getTransactionCount.mockResolvedValue(5);
			walletClientMock.sendTransaction.mockResolvedValue("0xTxHash");

			const txn = {
				to: "0xReceiver",
				data: "0xData",
				value: "1000000000000000000",
				gas: "200000",
				gasPrice: "1000000000",
			};

			// @ts-ignore
			const result = await executeSwapService.execute(txn);

			expect(result).toBe("0xTxHash");
			expect(walletClientMock.sendTransaction).toHaveBeenCalledWith({
				to: "0xReceiver",
				data: "0xData",
				value: 1000000000000000000n,
				gas: 200000n,
				gasPrice: 1000000000n,
				nonce: 5,
				account: walletClientMock.account,
				chain: walletClientMock.chain,
			});
		});

		it("should throw an error if wallet client is missing", async () => {
			walletServiceMock.getWalletClient.mockReturnValue(null);

			await expect(
				// @ts-ignore
				executeSwapService.execute({
					to: "0xReceiver",
					data: "0xData",
					value: "0",
					gas: "200000",
					gasPrice: "1000000000",
				}),
			).rejects.toThrow("Wallet client is not defined");
		});
	});

	describe("formatWithConfirmation", () => {
		it("should format the transaction details correctly", async () => {
			publicClientMock.waitForTransactionReceipt.mockResolvedValue({
				status: "success",
				blockNumber: 123456,
				gasUsed: 21000n,
				effectiveGasPrice: 1000000000n,
			});

			const txn = {
				from: "0xSender",
				to: "0xReceiver",
			};

			const hash = "0xTxHash";
			const result = await executeSwapService.formatWithConfirmation(
				txn as any,
				hash,
			);

			expect(result).toContain("✅ Confirmed");
			expect(result).toContain("Transaction Hash: 0xTxHash");
			expect(result).toContain("Block: 123456");
			expect(result).toContain("From: 0xSender");
			expect(result).toContain("To: 0xReceiver");
		});
	});
});
