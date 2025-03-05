import { assert, beforeEach, describe, expect, it, vi } from "vitest";
import { getAgentPositionsAction } from "../../actions/agent-positions";
import type { ATPActionParams } from "../../types";

describe("agent position", () => {
	const mockParams: ATPActionParams = {
		walletPrivateKey: "fake-private-key",
	};

	let mockRuntime;
	let mockMessage;

	it("should return a valid action object", () => {
		const action = getAgentPositionsAction(mockParams);
		const similies = [
			"GET_POSITIONS_AI_TOKENS",
			"VIEW_POSITIONS_AI_TOKENS",
			"CHECK_POSITIONS_AI_TOKENS",
			"GET_POSITIONS_AI_TOKENS",
			"SHOW_POSITIONS_AI_TOKENS",
		];
		expect(action).toBeDefined();
		expect(action.name).toBe("ATP_GET_POSITIONS");
		expect(action.similes).toEqual(expect.arrayContaining(similies));
		expect(action.validate).toBeInstanceOf(Function);
		expect(action.handler).toBeInstanceOf(Function);
	});

	describe("validation", () => {
		it("should pass validation", async () => {
			const action = getAgentPositionsAction(mockParams);
			const result = await action.validate(mockRuntime, mockMessage);
			expect(result).toBe(true);
		});
	});
});
