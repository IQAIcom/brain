import type { Address } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AddCollateralService } from "../../services/add-collateral";
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

describe("AddCollateralService", () => {
	let addCollateralService: AddCollateralService;

	beforeEach(() => {
		vi.clearAllMocks();
		mockGetPublicClient.mockReturnValue(mockPublicClient);
		mockGetWalletClient.mockReturnValue(mockWalletClient);
		addCollateralService = new AddCollateralService(mockWalletService);
	});

	it("should throw an error if the user has insufficient collateral balance", async () => {
		mockPublicClient.readContract.mockResolvedValueOnce("0xCollateralAddress");
		mockPublicClient.readContract.mockResolvedValueOnce(50n);

		await expect(
			addCollateralService.execute({
				pairAddress: "0xPairAddress" as Address,
				amount: 100n,
			}),
		).rejects.toThrow(
			"Insufficient collateral balance. Available: 50, Requested: 100",
		);
	});

	it("should successfully add collateral when balance is sufficient", async () => {
		mockPublicClient.readContract.mockResolvedValueOnce("0xCollateralAddress");
		mockPublicClient.readContract.mockResolvedValueOnce(200n);
		mockPublicClient.readContract.mockResolvedValueOnce(200n);
		mockPublicClient.simulateContract.mockResolvedValue({
			request: "mockRequest",
		});
		mockWalletClient.writeContract.mockResolvedValue("0xTxHash");
		mockPublicClient.waitForTransactionReceipt.mockResolvedValue({
			transactionHash: "0xTxHash",
		});

		const result = await addCollateralService.execute({
			pairAddress: "0xPairAddress" as Address,
			amount: 100n,
		});

		expect(result.txHash).toBe("0xTxHash");
		expect(result.amount).toBe(100n);
	});
});
