import type { WalletService } from "./wallet";
import type { AssembleResponseTxn } from "./assemble";
import type { Hash } from 'viem';

export class ExecuteSwapService {
    private readonly walletService: WalletService;

    constructor(walletService: WalletService) {
        this.walletService = walletService;
    }

    async execute(txn: AssembleResponseTxn): Promise<Hash> {
        const walletClient = this.walletService.getWalletClient();
        if (!walletClient || !walletClient.account) {
            throw new Error("Wallet client is not defined");
        }
        
        try {
            const hash = await walletClient.sendTransaction({
                to: txn.to as `0x${string}`,
                data: txn.data as `0x${string}`,
                value: BigInt(txn.value || '0'),
                gas: BigInt(txn.gas),
                gasPrice: BigInt(txn.gasPrice),
                nonce: txn.nonce,
                account: walletClient.account,
                chain: walletClient.chain,
            });
            
            return hash;
        } catch (error) {
            console.error("Error executing swap:", error);
            throw error;
        }
    }
}