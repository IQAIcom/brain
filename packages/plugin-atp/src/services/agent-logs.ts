import { API_URLS, DEV_API_URLS } from "../constants";

export enum LogType {
	Developer = "Developer",
	Agent = "Agent",
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export interface GetLogsParams {
	agentTokenContract: string;
	page?: number;
	limit?: number;
}

export interface PostLogParams {
	agentTokenContract: string;
	content: string;
	txHash?: string | null;
	apiKey: string;
}

export interface LogEntry {
	id: string;
	agentId: string;
	content: string;
	type: LogType;
	createdAt: string;
	chainId: number;
	txHash: string | null;
}

export interface GetLogsResponse {
	logs: LogEntry[];
	total: number;
	page: number;
	totalPages: number;
}

export class AgentLogsService {
	async getLogs({
		agentTokenContract,
		page = DEFAULT_PAGE,
		limit = DEFAULT_LIMIT,
	}: GetLogsParams): Promise<GetLogsResponse> {
		try {
			const endPoint = process.env.ATP_USE_DEV
				? DEV_API_URLS.LOGS
				: API_URLS.LOGS;
			const queryParams = new URLSearchParams({
				agentTokenContract,
				page: page.toString(),
				limit: limit.toString(),
			});

			const response = await fetch(`${endPoint}?${queryParams.toString()}`);

			if (!response.ok) {
				throw new Error(`API request failed with status ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			throw new Error(`Failed to fetch agent logs: ${error.message}`);
		}
	}

	async addLog({
		agentTokenContract,
		content,
		apiKey,
		txHash,
	}: PostLogParams): Promise<LogEntry> {
		try {
			const endPoint = process.env.ATP_USE_DEV
				? DEV_API_URLS.LOGS
				: API_URLS.LOGS;
			const response = await fetch(endPoint, {
				method: "POST",
				headers: {
					apiKey,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					agentTokenContract,
					content,
					txHash,
					type: LogType.Agent,
				}),
			});

			if (!response.ok) {
				throw new Error(`API request failed with status ${response.status}`);
			}

			return await response.json();
		} catch (error) {
			throw new Error(`Failed to add agent log: ${error.message}`);
		}
	}
	formatLogs(data: GetLogsResponse): string {
		if (!data.logs.length) {
			return "No logs found for this agent.";
		}

		const logsText = data.logs
			.map((log) => {
				const date = new Date(log.createdAt).toLocaleString();
				return `[${date}] [${log.type}] ${log.content}`;
			})
			.join("\n");

		return `Agent Logs (Page ${data.page} of ${data.totalPages}, showing ${data.logs.length} of ${data.total} logs):\n${logsText}`;
	}
}
