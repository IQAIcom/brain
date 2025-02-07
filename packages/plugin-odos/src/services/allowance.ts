import type { WalletService } from "./wallet";
import { erc20Abi } from 'viem' 

export class ApprovalService {
    private readonly walletService: WalletService;

    constructor(walletService: WalletService) {
        this.walletService = walletService;
    }

    async execute(tokenAddress: `0x${string}`, spenderAddress: `0x${string}`, amount: bigint) {
        const walletClient = this.walletService.getWalletClient();
        const publicClient = this.walletService.getPublicClient();
        
        try {
            // First check allowance
            const allowance = await publicClient.readContract({
                address: tokenAddress,
                abi: erc20Abi,
                functionName: 'allowance',
                args: [walletClient.account.address, spenderAddress],
            });

            // Only approve if current allowance is less than required amount
            if (allowance < amount) {
                const hash = await walletClient.writeContract({
                    address: tokenAddress,
                    abi: erc20Abi,
                    functionName: 'approve',
                    args: [spenderAddress, amount],
                    chain: walletClient.chain,
                    account: walletClient.account,
                });
                
                return hash;
            }
            
            return null; // No approval needed
        } catch (error) {
            console.error("Error in approval:", error);
            throw error;
        }
    }
}