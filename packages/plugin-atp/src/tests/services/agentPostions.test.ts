import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { API_URLS } from "../../constants";
import { AgentPositionsService } from "../../services/agent-positions";
import { WalletService } from "../../services/wallet";

vi.mock("./WalletService");

describe("AgentPositionsService", () => {
	let service: AgentPositionsService;
	let walletService: WalletService;

	beforeEach(() => {
		// @ts-ignore
		walletService = new WalletService() as vi.Mocked<WalletService>;
		walletService.getWalletClient = vi.fn().mockReturnValue({
			account: { address: "0xMockAddress" },
		});

		service = new AgentPositionsService(walletService);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("getPositions", () => {
		it("should fetch agent positions successfully", async () => {
			const mockResponse = {
				holdings: [
					{
						name: "ETH",
						tokenAmount: "1",
						currentPriceInUsd: 3000,
						tokenContract: "0xETHContract",
					},
				],
			};
			global.fetch = vi.fn(
				() =>
					Promise.resolve({
						ok: true,
						json: () => Promise.resolve(mockResponse),
					} as Response),
				// @ts-ignore
			) as vi.Mock;

			const result = await service.getPositions();
			expect(result).toEqual(mockResponse);
			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining(API_URLS.HOLDINGS),
				expect.objectContaining({ method: "GET" }),
			);
		});

		it("should throw an error if fetch fails", async () => {
			global.fetch = vi.fn(
				() =>
					Promise.resolve({
						ok: false,
						statusText: "API Error",
					} as Response),
				// @ts-ignore
			) as vi.Mock;

			await expect(service.getPositions()).rejects.toThrow(
				"Failed to fetch agent positions: API Error",
			);
		});
	});

	describe("formatPositions", () => {
		it("should format positions correctly", () => {
			const positions = {
				holdings: [
					{
						name: "ETH",
						tokenAmount: "1",
						currentPriceInUsd: 3000,
						tokenContract: "0xETHContract",
					},
				],
			};

			// @ts-ignore
			const formatted = service.formatPositions(positions);
			expect(formatted).toContain(
				"📊 *Your Active Positions*\n\n💰 ETH\n- Token Contract: 0xETHContract\n- Token Amount: 1.00\n- Current Price: 3.00K USD",
			);
		});

		it("should return 'No Active Positions Found' when holdings are empty", () => {
			const formatted = service.formatPositions({
				holdings: [],
				count: 0,
			});
			expect(formatted).toBe("📊 No Active Positions Found");
		});
	});
});
