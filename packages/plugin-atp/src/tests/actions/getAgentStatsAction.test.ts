import { assert, beforeEach, describe, expect, it, vi } from "vitest";
import { getAgentStatsAction } from "../../actions/agent-stats";
import type { ATPActionParams } from "../../types";

describe("agent stats", () => {
	const mockParams: ATPActionParams = {
		walletPrivateKey: "fake-private-key",
	};

	let mockRuntime;
	let mockMessage;

	it("should return a valid action object", () => {
		const action = getAgentStatsAction(mockParams);
		const similies = [
			"AGENT_STATS",
			"AGENT_DETAILS",
			"VIEW_AGENT_STATS",
			"VIEW_AGENT_DETAILS",
			"CHECK_AGENT_STATS",
			"GET_AGENT_STATS",
			"GET_AGENT_DETAILS",
			"SHOW_AGENT_STATS",
			"SHOW_AGENT_DETAILS",
			"CHECK_AGENT_STATS",
			"GET_AGENT_DETAILS",
			"GET_AGENT_STATS",
			"SHOW_AGENT_DETAILS",
			"SHOW_AGENT_STATS",
		];
		expect(action).toBeDefined();
		expect(action.name).toBe("ATP_AGENT_STATS");
		expect(action.similes).toEqual(expect.arrayContaining(similies));
		expect(action.validate).toBeInstanceOf(Function);
		expect(action.handler).toBeInstanceOf(Function);
	});

	describe("validation", () => {
		it("should pass validation", async () => {
			const action = getAgentStatsAction(mockParams);
			const result = await action.validate(mockRuntime, mockMessage);
			expect(result).toBe(true);
		});
	});
});
