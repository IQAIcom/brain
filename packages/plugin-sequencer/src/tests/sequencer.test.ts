import {
	ModelClass,
	elizaLogger,
	generateText,
	getEmbeddingZeroVector,
} from "@elizaos/core";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SequencerService } from "../services/sequencer";

const mockRuntime = {
	actions: [
		{ name: "ACTION_1", description: "Test action", handler: vi.fn() },
		{ name: "SEQUENCER" },
	],
	messageManager: { createMemory: vi.fn() },
	agentId: "agent-123",
} as any;

const mockMemory = {
	id: "memory-123",
	content: { text: "Test input" },
	userId: "user-123",
	embedding: getEmbeddingZeroVector(),
} as any;

const mockState = { roomId: "room-123" } as any;
const mockCallback = vi.fn();

vi.mock("@elizaos/core", () => ({
	elizaLogger: { info: vi.fn() },
	generateText: vi.fn(),
	stringToUuid: vi.fn(() => "mock-uuid"),
	ModelClass: { LARGE: "LARGE" },
}));

describe("SequencerService", () => {
	let service: SequencerService;

	beforeEach(() => {
		vi.clearAllMocks();
		service = new SequencerService(
			mockRuntime,
			mockMemory,
			mockState,
			mockCallback,
		);
	});

	it("should filter out SEQUENCER action and log available actions", async () => {
		await service.execute();
		expect(elizaLogger.info).toHaveBeenCalledWith(
			"ℹ️ All Actions names: ACTION_1",
		);
	});

	it("should call generateText with the correct parameters", async () => {
		await service.execute();
		expect(generateText).toHaveBeenCalledWith({
			runtime: mockRuntime,
			modelClass: ModelClass.LARGE,
			context: "Test input",
			customSystemPrompt: expect.any(String),
			maxSteps: 10,
			tools: expect.any(Object),
		});
	});
});
