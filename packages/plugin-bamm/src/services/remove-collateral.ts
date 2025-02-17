import type { WalletService } from "./wallet";
import { BAMM_ADDRESSES } from "../constants";
import { BAMM_FACTORY_ABI } from "../lib/bamm-factory.abi";
import { erc20Abi } from "viem";
import type { Address } from "viem";

export class RemoveCollateralService {
  private walletService: WalletService;

  constructor(walletService: WalletService) {
    this.walletService = walletService;
  }

  async execute({
    pairAddress,
    amount
  }: {
    pairAddress: Address;
    amount: bigint;
  }) {
    const publicClient = this.walletService.getPublicClient();
    const walletClient = this.walletService.getWalletClient();

    // Implementation will include:
    // 1. Get BAMM instance
    // 2. Check collateral balance
    // 3. Verify solvency after removal
    // 4. Execute withdrawal

    return {
      txHash: "0x",
      amount
    };
  }
}
