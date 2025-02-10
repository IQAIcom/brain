import { type Address, erc20Abi } from "viem";
import type { WalletService } from "./wallet";
import { ROUTER_ABI } from "../lib/router.abi";
import { AGENT_ROUTER_ADDRESS, BASE_TOKEN_ADDRESS } from "../constants";
import { fraxtal } from "viem/chains";

export class SwapService {
  private walletService: WalletService;
  private routerAddress: Address;
  private baseTokenAddress: Address;

  constructor(walletService: WalletService) {
    this.walletService = walletService;
    this.routerAddress = AGENT_ROUTER_ADDRESS as Address;
    this.baseTokenAddress = BASE_TOKEN_ADDRESS as Address;
  }

  async buy({ tokenContract, amount }: { tokenContract: Address; amount: bigint }) {
    const walletClient = this.walletService.getWalletClient();
    const publicClient = this.walletService.getPublicClient();

    // Approve base token
    const approveTx = await walletClient.writeContract({
      address: this.baseTokenAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [this.routerAddress, amount],
			chain: fraxtal,
			account: walletClient.account,
    });
    await publicClient.waitForTransactionReceipt({ hash: approveTx });

    // Execute buy
    const buyTx = await walletClient.writeContract({
      address: this.routerAddress,
      abi: ROUTER_ABI,
      functionName: 'buy',
      args: [tokenContract, amount, 0n],
			chain: fraxtal,
			account: walletClient.account,
    });
    await publicClient.waitForTransactionReceipt({ hash: buyTx });

    return { txHash: buyTx };
  }

  async sell({ tokenContract, amount }: { tokenContract: Address; amount: bigint }) {
    const walletClient = this.walletService.getWalletClient();
    const publicClient = this.walletService.getPublicClient();

    // Approve agent token
    const approveTx = await walletClient.writeContract({
      address: tokenContract,
      abi: erc20Abi,
      functionName: 'approve',
      args: [this.routerAddress, amount],
			chain: fraxtal,
			account: walletClient.account,
    });
    await publicClient.waitForTransactionReceipt({ hash: approveTx });

    // Execute sell
    const sellTx = await walletClient.writeContract({
      address: this.routerAddress,
      abi: ROUTER_ABI,
      functionName: 'sell',
      args: [tokenContract, amount,0n],
			chain: fraxtal,
			account: walletClient.account,
    });
    await publicClient.waitForTransactionReceipt({ hash: sellTx });

    return { txHash: sellTx };
  }
}
