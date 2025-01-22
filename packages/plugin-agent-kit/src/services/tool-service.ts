import { CdpAgentkit } from "@coinbase/cdp-agentkit-core";
import { CdpToolkit, type Tool } from "@coinbase/cdp-langchain";

export class ToolService {
    private client: CdpAgentkit;
    constructor(client: CdpAgentkit) {
        this.client = client;
    }

    async executeTool(tool: Tool, parameters: string | Record<string, any>) {
        const toolkit = new CdpToolkit(this.client);
        const tools = toolkit.getTools();
        const selectedTool = tools.find((t) => t.name === tool.name);

        if (!selectedTool) {
            throw new Error(`🚨 Tool ${tool.name} not found`);
        }

        return await selectedTool.invoke(parameters);
    }

    getTools(): Tool[] {
        const toolkit = new CdpToolkit(this.client);
        return toolkit.getTools() as Tool[];
    }
}
