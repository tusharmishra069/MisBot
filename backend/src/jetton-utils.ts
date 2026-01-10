import { TonClient, Address, WalletContractV4, internal, beginCell } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';

// TON Network Configuration
const TON_NETWORK = process.env.TON_NETWORK || 'testnet';
const TON_ENDPOINT = TON_NETWORK === 'mainnet'
    ? 'https://toncenter.com/api/v2/jsonRPC'
    : 'https://testnet.toncenter.com/api/v2/jsonRPC';

// Jetton Configuration
const JETTON_MINTER_ADDRESS = process.env.JETTON_MINTER_ADDRESS || '';
const ADMIN_MNEMONIC = process.env.TON_MNEMONIC || '';

let tonClient: TonClient | null = null;

/**
 * Initialize TON client
 */
export function initTonClient() {
    if (!tonClient) {
        tonClient = new TonClient({
            endpoint: TON_ENDPOINT,
        });
        console.log(`✅ TON Client initialized (${TON_NETWORK})`);
    }
    return tonClient;
}

/**
 * Mint MISBOT tokens to user's address
 */
export async function mintMisbotTokens(
    recipientAddress: string,
    amount: number
): Promise<{ success: boolean; error?: string }> {
    try {
        if (!JETTON_MINTER_ADDRESS) {
            return { success: false, error: 'Jetton minter address not configured' };
        }

        if (!ADMIN_MNEMONIC) {
            return { success: false, error: 'Admin mnemonic not configured' };
        }

        const client = initTonClient();

        // Get admin wallet
        const key = await mnemonicToPrivateKey(ADMIN_MNEMONIC.split(' '));
        const wallet = WalletContractV4.create({
            publicKey: key.publicKey,
            workchain: 0,
        });
        const contract = client.open(wallet);

        // Get current seqno
        const seqno = await contract.getSeqno();

        // Create mint message
        const mintBody = beginCell()
            .storeUint(21, 32)                                    // Mint op
            .storeUint(0, 64)                                     // Query ID
            .storeAddress(Address.parse(recipientAddress))        // Recipient
            .storeCoins(BigInt(Math.floor(amount * 1e9)))        // Amount in nanoMISBOT
            .endCell();

        // Send mint transaction
        await contract.sendTransfer({
            secretKey: key.secretKey,
            seqno: seqno,
            messages: [
                internal({
                    to: JETTON_MINTER_ADDRESS,
                    value: '0.05', // Gas for minting
                    body: mintBody,
                })
            ],
        });

        // Log only in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`✅ Minted ${amount} MISBOT to ${recipientAddress}`);
        }

        return { success: true };
    } catch (error: any) {
        console.error('❌ Mint error:', error);
        return { success: false, error: error.message || 'Failed to mint tokens' };
    }
}

/**
 * Get user's MISBOT balance
 */
export async function getMisbotBalance(
    userAddress: string
): Promise<number> {
    try {
        if (!JETTON_MINTER_ADDRESS) {
            return 0;
        }

        const client = initTonClient();

        // Get jetton wallet address for user
        const minterAddress = Address.parse(JETTON_MINTER_ADDRESS);
        const userAddr = Address.parse(userAddress);

        // Call get_wallet_address method
        const result = await client.runMethod(
            minterAddress,
            'get_wallet_address',
            [{
                type: 'slice',
                cell: beginCell()
                    .storeAddress(userAddr)
                    .endCell()
            }]
        );

        const jettonWalletAddress = result.stack.readAddress();

        // Get balance from jetton wallet
        const balanceResult = await client.runMethod(
            jettonWalletAddress,
            'get_wallet_data'
        );

        const balance = balanceResult.stack.readBigNumber();
        return Number(balance) / 1e9; // Convert to MISBOT
    } catch (error) {
        // Wallet doesn't exist yet or other error
        return 0;
    }
}

/**
 * Get total MISBOT supply
 */
export async function getTotalSupply(): Promise<number> {
    try {
        if (!JETTON_MINTER_ADDRESS) {
            return 0;
        }

        const client = initTonClient();
        const minterAddress = Address.parse(JETTON_MINTER_ADDRESS);

        const result = await client.runMethod(
            minterAddress,
            'get_jetton_data'
        );

        const totalSupply = result.stack.readBigNumber();
        return Number(totalSupply) / 1e9;
    } catch (error) {
        console.error('Failed to get total supply:', error);
        return 0;
    }
}
