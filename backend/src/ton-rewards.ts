import { TonClient, WalletContractV4, internal, Address } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { query } from './db';

// TON Network Configuration
const TON_NETWORK = process.env.TON_NETWORK || 'testnet';
const TON_ENDPOINT = TON_NETWORK === 'mainnet'
    ? 'https://toncenter.com/api/v2/jsonRPC'
    : 'https://testnet.toncenter.com/api/v2/jsonRPC';

// Reward Configuration
const REWARD_AMOUNT = '0.02'; // 0.02 TON
const POINTS_REQUIRED = 1000;

let tonClient: TonClient | null = null;
let walletContract: any = null;

/**
 * Initialize TON client and wallet
 */
export async function initTonWallet() {
    try {
        const mnemonic = process.env.TON_MNEMONIC;

        if (!mnemonic) {
            console.warn('⚠️  TON_MNEMONIC not set - TON rewards disabled');
            return false;
        }

        // Create TON client
        tonClient = new TonClient({
            endpoint: TON_ENDPOINT,
        });

        // Convert mnemonic to keypair
        const key = await mnemonicToPrivateKey(mnemonic.split(' '));

        // Create wallet contract
        const wallet = WalletContractV4.create({
            publicKey: key.publicKey,
            workchain: 0,
        });

        walletContract = tonClient.open(wallet);

        console.log(`✅ TON Wallet initialized (${TON_NETWORK})`);
        console.log(`📍 Wallet address: ${wallet.address.toString()}`);

        return true;
    } catch (error) {
        console.error('❌ Failed to initialize TON wallet:', error);
        return false;
    }
}

/**
 * Send TON reward to user
 */
export async function sendTonReward(
    telegramId: number,
    recipientAddress: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
        if (!tonClient || !walletContract) {
            return { success: false, error: 'TON wallet not initialized' };
        }

        // Validate recipient address
        let recipient: Address;
        try {
            recipient = Address.parse(recipientAddress);
        } catch {
            return { success: false, error: 'Invalid TON address' };
        }

        // Check user has enough points
        const userResult = await query(
            'SELECT points FROM users WHERE telegram_id = $1',
            [telegramId]
        );

        if (userResult.rows.length === 0) {
            return { success: false, error: 'User not found' };
        }

        const points = Number(userResult.rows[0].points);
        if (points < POINTS_REQUIRED) {
            return {
                success: false,
                error: `Need ${POINTS_REQUIRED} points, you have ${points}`
            };
        }

        // Check if user already claimed recently (prevent spam)
        const recentClaim = await query(
            `SELECT * FROM ton_rewards 
             WHERE telegram_id = $1 
             AND created_at > NOW() - INTERVAL '24 hours'
             AND status = 'completed'`,
            [telegramId]
        );

        if (recentClaim.rows.length > 0) {
            return {
                success: false,
                error: 'Already claimed in last 24 hours'
            };
        }

        // Create reward record (pending)
        const rewardResult = await query(
            `INSERT INTO ton_rewards (telegram_id, ton_address, amount, status)
             VALUES ($1, $2, $3, 'pending')
             RETURNING id`,
            [telegramId, recipientAddress, REWARD_AMOUNT]
        );

        const rewardId = rewardResult.rows[0].id;

        // Get mnemonic and create keypair
        const mnemonic = process.env.TON_MNEMONIC!;
        const key = await mnemonicToPrivateKey(mnemonic.split(' '));

        // Send TON
        const seqno = await walletContract.getSeqno();

        // Send transaction
        await walletContract.sendTransfer({
            secretKey: key.secretKey,
            seqno: seqno,
            messages: [
                internal({
                    to: recipient,
                    value: REWARD_AMOUNT,
                    body: 'MISBOT Reward'
                })
            ]
        });

        // Log only in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`✅ Sent ${REWARD_AMOUNT} TON to ${recipientAddress}`);
        }

        // Wait for transaction to be processed
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Get transaction hash (simplified - in production use proper tx tracking)
        const txHash = `${Date.now()}-${telegramId}`;

        // Update reward record
        await query(
            `UPDATE ton_rewards 
             SET status = 'completed', tx_hash = $1 
             WHERE id = $2`,
            [txHash, rewardId]
        );

        // Deduct points
        await query(
            'UPDATE users SET points = points - $1 WHERE telegram_id = $2',
            [POINTS_REQUIRED, telegramId]
        );

        console.log(`✅ Sent ${REWARD_AMOUNT} TON to ${recipientAddress}`);

        return {
            success: true,
            txHash
        };

    } catch (error: any) {
        console.error('❌ Failed to send TON reward:', error);

        // Update reward record to failed
        await query(
            `UPDATE ton_rewards 
             SET status = 'failed' 
             WHERE telegram_id = $1 
             AND status = 'pending'`,
            [telegramId]
        );

        return {
            success: false,
            error: error.message || 'Failed to send reward'
        };
    }
}

/**
 * Get user's reward history
 */
export async function getUserRewards(telegramId: number) {
    const result = await query(
        `SELECT * FROM ton_rewards 
         WHERE telegram_id = $1 
         ORDER BY created_at DESC 
         LIMIT 10`,
        [telegramId]
    );

    return result.rows;
}

/**
 * Check if user can claim reward
 */
export async function canClaimReward(telegramId: number): Promise<{
    canClaim: boolean;
    reason?: string;
    pointsNeeded?: number;
}> {
    // Check points
    const userResult = await query(
        'SELECT points FROM users WHERE telegram_id = $1',
        [telegramId]
    );

    if (userResult.rows.length === 0) {
        return { canClaim: false, reason: 'User not found' };
    }

    const points = Number(userResult.rows[0].points);
    if (points < POINTS_REQUIRED) {
        return {
            canClaim: false,
            reason: 'Not enough points',
            pointsNeeded: POINTS_REQUIRED - points
        };
    }

    // Check recent claims
    const recentClaim = await query(
        `SELECT * FROM ton_rewards 
         WHERE telegram_id = $1 
         AND created_at > NOW() - INTERVAL '24 hours'
         AND status = 'completed'`,
        [telegramId]
    );

    if (recentClaim.rows.length > 0) {
        return {
            canClaim: false,
            reason: 'Already claimed in last 24 hours'
        };
    }

    return { canClaim: true };
}
