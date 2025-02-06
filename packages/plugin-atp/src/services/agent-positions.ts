import type { WalletService } from "./wallet";

export class AgentPositionsService {
	private walletService: WalletService;

	constructor(walletService: WalletService) {
		this.walletService = walletService;
	}

	async getPositions() {
		throw new Error("Not implemented")
	}

	formatPositions(
		_positions: Awaited<ReturnType<AgentPositionsService["getPositions"]>>,
	) {
		throw new Error("Not implemented")
	}
}
