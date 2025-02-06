import type { Chain } from "viem";

export interface RouterResponse {
    depreacted: string;
    traceId: string;
    address: string;
}

export class RouterService {
	private readonly API_URL = "https://api.odos.xyz";
    private readonly chainId: number;

    constructor(chain: Chain) {
        this.chainId = chain.id;
    }
    async execute() {
        try {
            const response = await fetch(`${this.API_URL}/info/router/v2/${this.chainId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json() as RouterResponse;
            return data.address;
        } catch (error) {
            console.error("Error fetching router:", error);
        }
    }
}