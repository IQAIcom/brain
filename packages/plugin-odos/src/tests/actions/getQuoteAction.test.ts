import type { Chain } from "viem";
import { assert, beforeEach, describe, expect, it, vi } from "vitest";
import { getQuoteAction } from "../../actions/get-quote";
import type { OdosActionParams } from "../../types";

describe("getQuoteAction", () => {
	const mockParams: OdosActionParams = {
		walletPrivateKey: "fake-private-key",
		chain: "eth" as unknown as Chain,
	};

	let mockRuntime;
	let mockMessage;

	it("should return a valid action object", () => {
		const action = getQuoteAction(mockParams);
		const similies = [
			"GET_QUOTE",
			"EXCHANGE_TOKENS",
			"PRICE_CHECK",
			"GET_PRICE",
			"CHECK_PRICE",
			"GET_RATE",
			"CHECK_RATE",
			"GET_EXCHANGE_RATE",
			"CHECK_EXCHANGE_RATE",
		];
		expect(action).toBeDefined();
		expect(action.name).toBe("ODOS_GET_QUOTE");
		expect(action.similes).toEqual(expect.arrayContaining(similies));
		expect(action.validate).toBeInstanceOf(Function);
		expect(action.handler).toBeInstanceOf(Function);
	});

	describe("validation", () => {
		it("should pass validation", async () => {
			const action = getQuoteAction(mockParams);
			const result = await action.validate(mockRuntime, mockMessage);
			expect(result).toBe(true);
		});
	});
});
