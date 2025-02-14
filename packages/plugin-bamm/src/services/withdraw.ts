import type { WalletService } from "./wallet";
import { BAMM_ADDRESSES } from "../constants";
import { BAMM_FACTORY_ABI } from "../lib/bamm.abi";
import { erc20Abi } from "viem";
import type { Address } from "viem";

export class WithdrawService {
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
    // 2. Check LP token balance
    // 3. Execute withdrawal

    return {
      txHash: "0x",
      amount
    };
  }
}
