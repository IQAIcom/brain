import Overview from "@/components/overview";
import { apiClient } from "@/lib/api";
import type { UUID } from "@elizaos/core";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";

export default function AgentRoute() {
	const { agentId } = useParams<{ agentId: UUID }>();

	const query = useQuery({
		queryKey: ["agent", agentId],
		queryFn: () => apiClient.getAgent(agentId ?? ""),
		refetchInterval: 5_000,
		enabled: Boolean(agentId),
	});

	if (!agentId) return <div>No data.</div>;

	const character = query?.data?.character;

	if (!character) return null;

	return <Overview character={character} />;
}
