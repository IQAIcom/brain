import { describe, expect, it } from "vitest";
import { getAgentsAction } from "../../actions/get-agents";
import type { ATPActionParams } from "../../types";

describe("agent position", () => {
	const mockParams: ATPActionParams = {
		walletPrivateKey: "fake-private-key",
	};

	let mockRuntime;
	let mockMessage;

	it("should return a valid action object", () => {
		const action = getAgentsAction(mockParams);
		const similies = [
			"LIST_AGENTS",
			"SHOW_AGENTS",
			"TOP_AGENTS",
			"VIEW_AGENTS",
			"GET_AGENTS",
			"DISPLAY_AGENTS",
		];
		expect(action).toBeDefined();
		expect(action.name).toBe("ATP_GET_AGENTS");
		expect(action.similes).toEqual(expect.arrayContaining(similies));
		expect(action.validate).toBeInstanceOf(Function);
		expect(action.handler).toBeInstanceOf(Function);
	});

	describe("validation", () => {
		it("should pass validation", async () => {
			const action = getAgentsAction(mockParams);
			const result = await action.validate(mockRuntime, mockMessage);
			expect(result).toBe(true);
		});
	});
});
