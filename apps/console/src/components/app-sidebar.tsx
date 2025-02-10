import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSkeleton,
} from "@/components/ui/sidebar";
import { apiClient } from "@/lib/api";
import info from "@/lib/info.json";
import { range } from "@/lib/range";
import type { UUID } from "@elizaos/core";
import { useQuery } from "@tanstack/react-query";
import { Book, Cog, User } from "lucide-react";
import { NavLink, useLocation } from "react-router";
import ConnectionStatus from "./connection-status";

export function AppSidebar() {
	const location = useLocation();
	const query = useQuery({
		queryKey: ["agents"],
		queryFn: () => apiClient.getAgents(),
		refetchInterval: 5_000,
	});

	const agents = query?.data?.agents;

	return (
		<Sidebar variant="floating">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<NavLink to="/">
								<img
									alt="iq logo"
									src="/iq-logo.svg"
									width="100%"
									height="100%"
									className="size-7"
								/>
								<div className="flex flex-col gap-0.5 leading-none">
									<span className="font-semibold">Brain Console</span>
									<span className="">v{info?.version}</span>
								</div>
							</NavLink>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Agents</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{query?.isPending ? (
								<div>
									{range(5).map((index) => (
										<SidebarMenuItem key={index}>
											<SidebarMenuSkeleton />
										</SidebarMenuItem>
									))}
								</div>
							) : (
								<div>
									{agents?.map((agent: { id: UUID; name: string }) => (
										<SidebarMenuItem key={agent.id}>
											<NavLink to={`/chat/${agent.id}`}>
												<SidebarMenuButton
													isActive={location.pathname.includes(agent.id)}
												>
													<User />
													<span>{agent.name}</span>
												</SidebarMenuButton>
											</NavLink>
										</SidebarMenuItem>
									))}
								</div>
							)}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<NavLink
							to="https://elizaos.github.io/eliza/docs/intro/"
							target="_blank"
						>
							<SidebarMenuButton>
								<Book /> Documentation
							</SidebarMenuButton>
						</NavLink>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton disabled>
							<Cog /> Settings
						</SidebarMenuButton>
					</SidebarMenuItem>
					<ConnectionStatus />
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
