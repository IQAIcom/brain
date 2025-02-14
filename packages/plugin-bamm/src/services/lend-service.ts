import type { WalletService } from "./wallet-service";
import { BAMM_ADDRESSES, BAMM_ABI } from "../lib/constants";
import type { Address } from "viem";

export class LendService {
  private walletService: WalletService;

  constructor(walletService: WalletService) {
    this.walletService = walletService;
  }

  async lend({
    pairAddress,
    amount
  }: {
    pairAddress: Address;
    amount: bigint;
  }) {
    const publicClient = this.walletService.getPublicClient();
    const walletClient = this.walletService.getWalletClient();

    // Implementation will include:
    // 1. Check LP token balance
    // 2. Approve BAMM contract
    // 3. Execute lending transaction
  }
}
