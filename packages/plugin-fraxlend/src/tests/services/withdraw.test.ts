import { type Address, erc20Abi } from "viem";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FRAXLEND_ABI } from "../../lib/fraxlend.abi";
import type { WalletService } from "../../services/wallet";
import { WithdrawService } from "../../services/withdraw";

// Mock the WalletService and its methods
const mockGetPublicClient = vi.fn();
const mockGetWalletClient = vi.fn();

const mockWalletService: WalletService = {
	getPublicClient: mockGetPublicClient,
	getWalletClient: mockGetWalletClient,
} as unknown as WalletService;

describe("WithdrawService", () => {
	// Test data
	const mockPairAddress =
		"0x1234567890123456789012345678901234567890" as Address;
	const mockUserAddress =
		"0x0987654321098765432109876543210987654321" as Address;
	const mockAmount = BigInt(1000);
	const mockShares = BigInt(2000);
	const mockTxHash =
		"0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";

	// Mock clients
	const mockPublicClient = {
		readContract: vi.fn(),
		simulateContract: vi.fn(),
		waitForTransactionReceipt: vi.fn(),
	};

	const mockWalletClient = {
		account: {
			address: mockUserAddress,
		},
		writeContract: vi.fn(),
	};

	let withdrawService: WithdrawService;

	beforeEach(() => {
		// Reset mocks
		vi.resetAllMocks();

		// Setup mock return values
		mockGetPublicClient.mockReturnValue(mockPublicClient);
		mockGetWalletClient.mockReturnValue(mockWalletClient);

		// Initialize the service
		withdrawService = new WithdrawService(mockWalletService);
	});

	afterEach(() => {
		vi.resetAllMocks();
	});

	it("should successfully withdraw when shares are sufficient", async () => {
		// Setup mocks for a successful withdrawal
		mockPublicClient.readContract.mockResolvedValue(mockShares);
		mockPublicClient.simulateContract.mockResolvedValue({
			request: { someRequestData: true },
		});
		mockWalletClient.writeContract.mockResolvedValue(mockTxHash);
		mockPublicClient.waitForTransactionReceipt.mockResolvedValue({
			transactionHash: mockTxHash,
		});

		// Execute the withdrawal
		const result = await withdrawService.execute({
			pairAddress: mockPairAddress,
			amount: mockAmount,
		});

		// Verify function calls
		expect(mockPublicClient.readContract).toHaveBeenCalledWith({
			address: mockPairAddress,
			abi: FRAXLEND_ABI,
			functionName: "balanceOf",
			args: [mockUserAddress],
			account: mockWalletClient.account,
		});

		expect(mockPublicClient.simulateContract).toHaveBeenCalledWith({
			address: mockPairAddress,
			abi: FRAXLEND_ABI,
			functionName: "redeem",
			args: [mockAmount, mockUserAddress, mockUserAddress],
			account: mockWalletClient.account,
		});

		expect(mockWalletClient.writeContract).toHaveBeenCalledWith({
			someRequestData: true,
		});

		expect(mockPublicClient.waitForTransactionReceipt).toHaveBeenCalledWith({
			hash: mockTxHash,
		});

		// Verify result
		expect(result).toEqual({
			txHash: mockTxHash,
			amount: mockAmount,
		});
	});

	it("should throw an error when shares are insufficient", async () => {
		// Setup mocks for insufficient shares
		const insufficientShares = BigInt(500); // Less than mockAmount
		mockPublicClient.readContract.mockResolvedValue(insufficientShares);

		// Execute and expect error
		await expect(
			withdrawService.execute({
				pairAddress: mockPairAddress,
				amount: mockAmount,
			}),
		).rejects.toThrow(
			`Insufficient shares for withdrawal. Available: ${insufficientShares}, Requested: ${mockAmount}`,
		);

		// Verify function calls
		expect(mockPublicClient.readContract).toHaveBeenCalledWith({
			address: mockPairAddress,
			abi: FRAXLEND_ABI,
			functionName: "balanceOf",
			args: [mockUserAddress],
			account: mockWalletClient.account,
		});

		// Verify other functions were not called
		expect(mockPublicClient.simulateContract).not.toHaveBeenCalled();
		expect(mockWalletClient.writeContract).not.toHaveBeenCalled();
		expect(mockPublicClient.waitForTransactionReceipt).not.toHaveBeenCalled();
	});

	it("should handle contract simulation errors", async () => {
		// Setup mocks
		mockPublicClient.readContract.mockResolvedValue(mockShares);

		// Mock a contract simulation error
		const simulationError = new Error("Contract simulation failed");
		mockPublicClient.simulateContract.mockRejectedValue(simulationError);

		// Execute and expect error
		await expect(
			withdrawService.execute({
				pairAddress: mockPairAddress,
				amount: mockAmount,
			}),
		).rejects.toThrow(simulationError);
	});

	it("should handle transaction errors", async () => {
		// Setup mocks
		mockPublicClient.readContract.mockResolvedValue(mockShares);
		mockPublicClient.simulateContract.mockResolvedValue({
			request: { someRequestData: true },
		});

		// Mock a transaction error
		const txError = new Error("Transaction failed");
		mockWalletClient.writeContract.mockRejectedValue(txError);

		// Execute and expect error
		await expect(
			withdrawService.execute({
				pairAddress: mockPairAddress,
				amount: mockAmount,
			}),
		).rejects.toThrow(txError);
	});
});
