import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	type AssembleResponseTxn,
	AssembleService,
} from "../../services/assemble";
import type { WalletService } from "../../services/wallet";

describe("AssembleService", () => {
	let assembleService: AssembleService;
	let mockWalletService: WalletService;

	beforeEach(() => {
		mockWalletService = {
			getWalletClient: vi.fn(() => ({
				account: { address: "0xMockedUserAddress" },
			})),
		} as unknown as WalletService;

		assembleService = new AssembleService(mockWalletService);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should successfully fetch and return an assembled transaction", async () => {
		const mockResponse: AssembleResponseTxn = {
			chainId: 1,
			gas: "21000",
			gasPrice: "50",
			value: "0",
			to: "0xMockedRouter",
			from: "0xMockedUserAddress",
			data: "0xMockedData",
			nonce: 42,
		};

		global.fetch = vi.fn(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve({ transaction: mockResponse }),
			}),
		) as any;

		const result = await assembleService.execute("mockPathId");
		expect(result).toEqual(mockResponse);
		expect(fetch).toHaveBeenCalledWith(
			"https://api.odos.xyz/sor/assemble",
			expect.anything(),
		);
	});

	it("should throw an error if user address is not defined", async () => {
		// @ts-ignore
		(mockWalletService.getWalletClient as vi.Mock).mockReturnValue(null);

		await expect(assembleService.execute("mockPathId")).rejects.toThrow(
			"User address is not defined",
		);
	});

	it("should handle network errors gracefully", async () => {
		global.fetch = vi.fn(() =>
			Promise.reject(new Error("Network Error")),
		) as any;

		await expect(
			assembleService.execute("mockPathId"),
		).resolves.toBeUndefined();
		console.error = vi.fn();
	});
});
