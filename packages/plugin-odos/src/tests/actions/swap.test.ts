import type { Chain } from "viem";
import { assert, beforeEach, describe, expect, it, vi } from "vitest";
import type { OdosActionParams } from "../../types";
import { swapAction } from "./../../actions/swap";

describe("swapAction   ", () => {
	const mockParams: OdosActionParams = {
		walletPrivateKey: "fake-private-key",
		chain: "eth" as unknown as Chain,
	};

	let mockRuntime;
	let mockMessage;

	it("should return a valid action object", () => {
		const action = swapAction(mockParams);
		const similies = [
			"SWAP_TOKENS",
			"EXECUTE_SWAP",
			"PERFORM_SWAP",
			"EXCHANGE_TOKENS",
			"TRADE_TOKENS",
			"DO_SWAP",
			"MAKE_SWAP",
			"CONVERT_TOKENS",
		];
		expect(action).toBeDefined();
		expect(action.name).toBe("ODOS_SWAP");
		expect(action.similes).toEqual(expect.arrayContaining(similies));
		expect(action.validate).toBeInstanceOf(Function);
		expect(action.handler).toBeInstanceOf(Function);
	});

	describe("validation", () => {
		it("should pass validation", async () => {
			const action = swapAction(mockParams);
			const result = await action.validate(mockRuntime, mockMessage);
			expect(result).toBe(true);
		});
	});
});
