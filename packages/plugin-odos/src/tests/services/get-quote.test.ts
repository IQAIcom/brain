import type { IAgentRuntime, Memory, State } from "@elizaos/core";
import type { Address } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	GetQuoteActionService,
	type QuoteResponse,
} from "../../services/get-quote";
import { InputParserService } from "../../services/input-parser";
import { WalletService } from "../../services/wallet";

vi.mock("./WalletService");
vi.mock("./InputParserService");

describe("GetQuoteActionService", () => {
	let getQuoteService: GetQuoteActionService;
	let walletService: WalletService;

	beforeEach(() => {
		walletService = new WalletService();
		getQuoteService = new GetQuoteActionService(walletService);
	});

	it("should fetch and return a valid quote response", async () => {
		vi.spyOn(walletService, "getWalletClient").mockReturnValue({
			// @ts-ignore
			account: { address: "0xUserAddress" },
		});

		const mockParsedOutput = {
			fromToken: "0xTokenA" as Address,
			toToken: "0xTokenB" as Address,
			chainId: 1,
			amount: "1000000000000000000",
		};

		vi.spyOn(InputParserService.prototype, "parseInputs").mockResolvedValue(
			mockParsedOutput,
		);

		global.fetch = vi.fn(() =>
			Promise.resolve({
				ok: true,
				json: () =>
					Promise.resolve({
						inTokens: ["TOKEN_A"],
						outTokens: ["TOKEN_B"],
						inAmounts: ["1000000000000000000"],
						outAmounts: ["2000000000000000000"],
						gasEstimate: 21000,
						dataGasEstimate: 5000,
						gweiPerGas: 30,
						gasEstimateValue: 1.5,
						inValues: [1000],
						outValues: [2000],
						netOutValue: 2000,
						priceImpact: 0.5,
						percentDiff: 0.1,
						pathId: "path123",
						blockNumber: 12345678,
					}),
			}),
		) as any;

		const result = await getQuoteService.execute(
			{} as IAgentRuntime,
			{} as Memory,
			{} as State,
		);
		expect(result).toMatchObject({
			inTokens: ["TOKEN_A"],
			outTokens: ["TOKEN_B"],
			priceImpact: 0.5,
			blockNumber: 12345678,
		});
	});

	it("should throw an error if user address is not defined", async () => {
		vi.spyOn(walletService, "getWalletClient").mockReturnValue(null);

		vi.spyOn(InputParserService.prototype, "parseInputs").mockResolvedValue({
			fromToken: "0xTokenA",
			toToken: "0xTokenB",
			chainId: 1,
			amount: "1000000000000000000",
		});

		await expect(
			getQuoteService.execute({} as IAgentRuntime, {} as Memory, {} as State),
		).rejects.toThrow("User address is not defined");
	});

	it("should throw an error if API response is not OK", async () => {
		vi.spyOn(walletService, "getWalletClient").mockReturnValue({
			// @ts-ignore
			account: { address: "0xUserAddress" as Address },
		});

		vi.spyOn(InputParserService.prototype, "parseInputs").mockResolvedValue({
			fromToken: "0xTokenA",
			toToken: "0xTokenB",
			chainId: 1,
			amount: "1000000000000000000",
		});

		global.fetch = vi.fn(() =>
			Promise.resolve({
				ok: false,
				statusText: "Bad Request",
				json: () => Promise.resolve({ error: "Invalid input" }),
			}),
		) as any;

		await expect(
			getQuoteService.execute({} as IAgentRuntime, {} as Memory, {} as State),
		).rejects.toThrow("Failed to fetch quote: Bad Request");
	});

	it("should correctly format a quote response", () => {
		const quote: QuoteResponse = {
			inTokens: ["TOKEN_A"],
			outTokens: ["TOKEN_B"],
			inAmounts: ["1000000000000000000"],
			outAmounts: ["2000000000000000000"],
			gasEstimate: 21000,
			dataGasEstimate: 5000,
			gweiPerGas: 30,
			gasEstimateValue: 1.5,
			inValues: [1000],
			outValues: [2000],
			netOutValue: 2000,
			priceImpact: 0.5,
			percentDiff: 0.1,
			pathId: "path123",
			blockNumber: 12345678,
		};

		const formatted = getQuoteService.format(quote);
		expect(formatted).toContain("💱 Quote Details");
		expect(formatted).toContain("TOKEN_A");
		expect(formatted).toContain("TOKEN_B");
		expect(formatted).toContain("Net Output Value: $2000.00");
		expect(formatted).toContain("Price Impact: 0.50%");
	});
});
