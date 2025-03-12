import { afterEach, describe, expect, it, vi } from "vitest";
import { API_URLS } from "../../constants";
import {
	type GetAgentsParams,
	GetAgentsService,
} from "../../services/get-agents";
import type { Agent } from "../../types";

global.fetch = vi.fn();

const mockAgents: Agent[] = [
	{
		name: "AgentX",
		ticker: "AGX",
		currentPriceInUSD: 1.23,
		currentPriceInIq: 100,
		holdersCount: 5000,
		inferenceCount: 200,
		isActive: true,
		tokenContract: "0x123...",
		agentContract: "0x456...",
	},
];

describe("GetAgentsService", () => {
	const service = new GetAgentsService();

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("fetches agents successfully", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: true,
			json: async () => ({ agents: mockAgents }),
		} as Response);

		const params: GetAgentsParams = { sort: "mcap", limit: 10 };
		const agents = await service.getAgents(params);

		expect(fetch).toHaveBeenCalledWith(
			expect.stringContaining(API_URLS.AGENTS),
			expect.anything(),
		);
		expect(agents).toEqual(mockAgents);
	});

	it("throws an error when API response is not ok", async () => {
		vi.mocked(fetch).mockResolvedValueOnce({
			ok: false,
			statusText: "Internal Server Error",
		} as Response);

		await expect(service.getAgents({})).rejects.toThrow(
			"Failed to fetch agent stats: Internal Server Error",
		);
	});

	it("returns 'No Agents found' when no agents exist", () => {
		expect(service.formatAgents([])).toBe("📊 No Agents found");
	});
});
