import type { Address } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BorrowService } from "../../services/borrow";
import type { WalletService } from "../../services/wallet";

const mockGetPublicClient = vi.fn();
const mockGetWalletClient = vi.fn();

const mockWalletService: WalletService = {
	getPublicClient: mockGetPublicClient,
	getWalletClient: mockGetWalletClient,
} as unknown as WalletService;

const mockPublicClient = {
	readContract: vi.fn(),
	simulateContract: vi.fn(),
	waitForTransactionReceipt: vi.fn(),
};

const mockWalletClient = {
	account: { address: "0xUserAddress" as Address },
	writeContract: vi.fn(),
};

describe("BorrowService", () => {
	let borrowService: BorrowService;

	beforeEach(() => {
		vi.clearAllMocks();

		mockGetPublicClient.mockReturnValue(mockPublicClient);
		mockGetWalletClient.mockReturnValue(mockWalletClient);
		borrowService = new BorrowService(mockWalletService);
	});

	it("should throw an error if the user has no collateral", async () => {
		mockPublicClient.readContract.mockResolvedValue(0n);

		await expect(
			borrowService.execute({
				pairAddress: "0xPairAddress" as Address,
				borrowAmount: 100n,
				collateralAmount: 50n,
				receiver: "0xReceiverAddress" as Address,
			}),
		).rejects.toThrow("You don't have any collateral to borrow with");
	});

	it("should execute a borrow transaction successfully", async () => {
		mockPublicClient.readContract.mockResolvedValue(100n); // User has collateral
		mockPublicClient.simulateContract.mockResolvedValue({
			request: "mockRequest",
		});
		mockWalletClient.writeContract.mockResolvedValue("0xTxHash");
		mockPublicClient.waitForTransactionReceipt.mockResolvedValue({
			transactionHash: "0xTxHash",
		});

		const result = await borrowService.execute({
			pairAddress: "0xPairAddress" as Address,
			borrowAmount: 100n,
			collateralAmount: 50n,
			receiver: "0xReceiverAddress" as Address,
		});

		expect(result.txHash).toBe("0xTxHash");
		expect(result.borrowAmount).toBe(100n);
		expect(result.collateralAmount).toBe(50n);
		expect(result.receiver).toBe("0xReceiverAddress");
	});
});
