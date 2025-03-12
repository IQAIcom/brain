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
		expect(action).toBeDefined();
		expect(typeof action.name).toBe("string");
		for (const simile of action.similes) {
			expect(typeof simile).toBe("string");
		}
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
