import type { WalletService } from "./wallet";
import { BAMM_ADDRESSES } from "../constants";
import { BAMM_FACTORY_ABI } from "../lib/bamm.abi";
import { erc20Abi } from "viem";
import type { Address } from "viem";

export class LendService {
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
    const userAddress = walletClient.account.address;

    // Check LP token balance
    const lpBalance = await publicClient.readContract({
      address: pairAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [userAddress]
    });

    if (lpBalance < amount) {
      throw new Error("Insufficient LP token balance");
    }

    // Get or create BAMM for the pair
    const bamm = await publicClient.readContract({
      address: BAMM_ADDRESSES.FACTORY,
      abi: BAMM_FACTORY_ABI,
      functionName: "pairToBamm",
      args: [pairAddress]
    });

    // Approve LP tokens
    const { request: approveRequest } = await publicClient.simulateContract({
      address: pairAddress,
      abi: erc20Abi,
      functionName: "approve",
      args: [bamm, amount],
      account: walletClient.account
    });
    await walletClient.writeContract(approveRequest);

    // Transfer LP tokens to BAMM
    const { request: transferRequest } = await publicClient.simulateContract({
      address: pairAddress,
      abi: erc20Abi,
      functionName: "transfer",
      args: [bamm, amount],
      account: walletClient.account
    });

    const hash = await walletClient.writeContract(transferRequest);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return {
      txHash: receipt.transactionHash,
      amount
    };
  }
}
