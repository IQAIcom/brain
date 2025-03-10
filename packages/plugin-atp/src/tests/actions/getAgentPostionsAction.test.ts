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
			const action = getAgentPositionsAction(mockParams);
			const result = await action.validate(mockRuntime, mockMessage);
			expect(result).toBe(true);
		});
	});
});
