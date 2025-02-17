import type { WalletService } from "./wallet";
import { BAMM_ADDRESSES } from "../constants";
import { BAMM_FACTORY_ABI } from "../lib/bamm-factory.abi";
import { BAMM_ABI } from "../lib/bamm.abi"; // Provided BAMM ABI
import type { Address } from "viem";
import dedent from "dedent";

export interface BammPosition {
	bamm: Address;
	isUser: boolean;
	vault: {
		token0: bigint;
		token1: bigint;
		rented: bigint;
	} | null;
}

export class BammPositionsService {
	private walletService: WalletService;

	constructor(walletService: WalletService) {
		this.walletService = walletService;
	}

	async getPositions(): Promise<BammPosition[]> {
		const publicClient = this.walletService.getPublicClient();
		const walletClient = this.walletService.getWalletClient();
		const userAddress = walletClient.account.address;

		// 1. Retrieve the list of all BAMM addresses from the factory
		const bammsArray = [
			...(await publicClient.readContract({
				address: BAMM_ADDRESSES.FACTORY,
				abi: BAMM_FACTORY_ABI,
				functionName: "bammsArray",
				args: [],
			})),
		];

		const positions: BammPosition[] = [];

		// 2. Loop through each BAMM contract address
		for (const bamm of bammsArray) {
			// Safety-check for a valid address
			if (bamm === "0x0000000000000000000000000000000000000000") {
				continue;
			}

			// 3. Check if the user is registered in this BAMM using isUser (returns a bool)
			const isUser: boolean = await publicClient.readContract({
				address: bamm,
				abi: BAMM_ABI,
				functionName: "isUser",
				args: [userAddress],
			});

			// 4. If the user is registered, get their vault details
			let vault = null;
			if (isUser) {
				vault = await publicClient.readContract({
					address: bamm,
					abi: BAMM_ABI,
					functionName: "getUserVault",
					args: [userAddress],
				});
			}

			positions.push({
				bamm,
				isUser,
				vault,
			});
		}

		return positions;
	}

	formatPositions(positions: BammPosition[]) {
		if (
			positions.length === 0 ||
			positions.map((p) => p.isUser).every((v) => !v)
		) {
			return "📊 No Active BAMM Positions Found";
		}

		const formattedPositions = positions
			.map((pos) => {
				if (!pos.isUser) return null;
				const isLend =
					pos.vault.rented === null || pos.vault.rented <= BigInt(0);

				return dedent`
            💰 BAMM Position
            - Contract: ${pos.bamm}
            - Token0 Amount: ${pos.vault?.token0.toString() || "0"}
            - Token1 Amount: ${pos.vault?.token1.toString() || "0"}
            ${isLend ? "💸 Lending" : `💰 Borrowing: ${pos.vault.rented}`}
        `;
			})
			.filter(Boolean)
			.join("\n");

		return `📊 *Your Active BAMM Positions*\n\n${formattedPositions}`;
	}
}
