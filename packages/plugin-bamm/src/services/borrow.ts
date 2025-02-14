import type { WalletService } from "./wallet";
import { BAMM_ADDRESSES } from "../constants";
import { BAMM_FACTORY_ABI } from "../lib/bamm.abi";
import { erc20Abi } from "viem";
import type { Address } from "viem";

export class BorrowService {
  private walletService: WalletService;

  constructor(walletService: WalletService) {
    this.walletService = walletService;
  }

  private async ensureTokenApproval(
    tokenAddress: Address,
    spender: Address,
    amount: bigint
  ) {
    const walletClient = this.walletService.getWalletClient();
    const { request } = await this.walletService.getPublicClient().simulateContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender, amount],
      account: walletClient.account,
    });
    await walletClient.writeContract(request);
  }

  async execute({
    pairAddress,
    borrowAmount,
    collateralAmount,
    receiver
  }: {
    pairAddress: Address;
    borrowAmount: bigint;
    collateralAmount: bigint;
    receiver: Address;
  }) {
    const publicClient = this.walletService.getPublicClient();
    const walletClient = this.walletService.getWalletClient();
    const userAddress = walletClient.account.address;

    // Check collateral balance
    const collateralBalance = await publicClient.readContract({
      address: pairAddress,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [userAddress]
    });

    if (collateralBalance < collateralAmount) {
      throw new Error(`Insufficient collateral balance. Available: ${collateralBalance}, Required: ${collateralAmount}`);
    }

    // Get BAMM instance for the pair
    const bamm = await publicClient.readContract({
      address: BAMM_ADDRESSES.FACTORY,
      abi: BAMM_FACTORY_ABI,
      functionName: "pairToBamm",
      args: [pairAddress]
    });

    // Create BAMM if it doesn't exist
    if (!bamm) {
      const { request } = await publicClient.simulateContract({
        address: BAMM_ADDRESSES.FACTORY,
        abi: BAMM_FACTORY_ABI,
        functionName: "createBamm",
        args: [pairAddress],
        account: walletClient.account
      });
      await walletClient.writeContract(request);
    }

    // Ensure collateral approval
    await this.ensureTokenApproval(pairAddress, bamm, collateralAmount);

    // TODO: Find how to execute borrow transaction
    return {
      txHash: '0x',
      borrowAmount,
      collateralAmount,
      receiver
    };
  }
}
