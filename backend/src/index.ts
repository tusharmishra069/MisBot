import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { verifyTelegramWebAppData, parseUserData } from './utils/telegramAuth';
import { query } from './db';
import { initTonClient, mintMisbotTokens, getMisbotBalance, getTotalSupply } from './jetton-utils';

dotenv.config();

// Optimize DB on startup
const initDb = async () => {
    try {
        await query('SELECT NOW()'); // Test Connection
        console.log('✅ Database Connected Successfully');

        await query('CREATE INDEX IF NOT EXISTS idx_users_points ON users (points DESC)');
        console.log('✅ Database Optimized: Indexes Verified');

        // Initialize TON client for Jetton operations
        initTonClient();
    } catch (e) {
        console.error('❌ Database Connection Failed:', e);
        process.exit(1); // Fatal error if DB is down
    }
};

initDb();

const app = express();

// CORS Configuration - Environment-based origin whitelist
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`[CORS] Blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

app.use(helmet());
app.use(express.json());

// Rate Limiting - Prevent abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const tapLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // Max 60 taps per minute per IP
    message: 'Too many tap requests, please slow down.',
});

app.use(limiter); // Apply to all requests

// --- Middleware ---
const authenticateTelegram = (req: any, res: any, next: any) => {
    const initData = req.headers['x-telegram-init-data'];

    // DEV BYPASS: Allow testing on localhost without Telegram
    if (process.env.NODE_ENV !== 'production' && initData === 'dev_data') {
        req.user = {
            id: 123456789,
            username: 'test_user',
            first_name: 'Test',
            last_name: 'User'
        };
        return next();
    }

    if (!initData) return res.status(401).json({ error: 'Missing initData' });

    try {
        const isValid = verifyTelegramWebAppData(initData as string);

        if (!isValid) {
            // CRITICAL PRODUCTION LOG
            console.error(`[Auth Failed] Signature Mismatch!`);
            console.error(`[Auth Failed] Server Token: ${process.env.BOT_TOKEN ? 'Set' : 'MISSING'}`);
            console.error(`[Auth Failed] Received Data Length: ${initData.length}`);
            return res.status(403).json({ error: 'Invalid initData signature' });
        }

        const user = parseUserData(initData as string);
        req.user = user;
        next();
    } catch (e) {
        console.error(`[Auth Crash]`, e);
        return res.status(403).json({ error: 'Auth failed' });
    }
};

// --- Health Check ---
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Routes ---

// 1. Auth / Get User State
app.get('/user', authenticateTelegram, async (req: any, res) => {
    const { id, username } = req.user;

    // Upsert User
    try {
        let userResult = await query('SELECT * FROM users WHERE telegram_id = $1', [id]);

        if (userResult.rows.length === 0) {
            await query('INSERT INTO users (telegram_id, username) VALUES ($1, $2)', [id, username]);
            userResult = await query('SELECT * FROM users WHERE telegram_id = $1', [id]);
        }

        const stats = userResult.rows[0];

        // Fetch Wallets
        const wallets = await query('SELECT chain, address FROM wallets WHERE telegram_id = $1', [id]);

        res.json({ ...stats, wallets: wallets.rows });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Database error' });
    }
});

// 1b. Update User Profile
app.put('/user/profile', authenticateTelegram, async (req: any, res) => {
    const { id } = req.user;
    const { username } = req.body;

    // Validate username
    if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'Username is required' });
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 1 || trimmedUsername.length > 255) {
        return res.status(400).json({ error: 'Username must be 1-255 characters' });
    }

    try {
        await query('UPDATE users SET username = $1 WHERE telegram_id = $2', [trimmedUsername, id]);
        res.json({ success: true, username: trimmedUsername });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// 2. Tap (Core Game Loop)
app.post('/tap', tapLimiter, authenticateTelegram, [
    body('count').isInt({ min: 1, max: 1000 }).withMessage('Invalid tap count')
], async (req: any, res: any) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: 'Invalid tap count' });
    }
    const { id } = req.user;
    const { count } = req.body;

    if (process.env.NODE_ENV !== 'production') {
        console.log(`[Tap] Received ${count} taps from User ${id}`);
    }

    try {
        const userRes = await query('SELECT energy, points, last_tap_at FROM users WHERE telegram_id = $1', [id]);
        const user = userRes.rows[0];

        // Max energy check implies regeneration logic (skipped for brevity, assuming simple decrement)
        if (user.energy < count) {
            return res.status(400).json({ error: 'Not enough energy' });
        }

        // --- ANTI-CHEAT: Rate Limiting ---
        // Verify time difference? 
        // For this demo, we simply trust but cap the count and reduce energy.

        const newPoints = BigInt(user.points) + BigInt(count);
        const newEnergy = user.energy - count;

        await query('UPDATE users SET points = $1, energy = $2, last_tap_at = NOW() WHERE telegram_id = $3', [newPoints, newEnergy, id]);

        // Log for analysis
        await query('INSERT INTO tap_logs (telegram_id, tap_count) VALUES ($1, $2)', [id, count]);

        res.json({ points: newPoints.toString(), energy: newEnergy });
    } catch (e) {
        res.status(500).json({ error: 'Tap failed' });
    }
});

// 3. Connect Wallet
app.post('/connect-wallet', authenticateTelegram, [
    body('chain').equals('TON').withMessage('Invalid chain'),
    body('address').notEmpty().withMessage('Address required')
], async (req: any, res: any) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }
    const { id, username } = req.user;
    const { chain, address } = req.body;

    try {
        const result = await query(
            'INSERT INTO wallets (telegram_id, chain, address) VALUES ($1, $2, $3) ON CONFLICT (telegram_id, chain) DO UPDATE SET address = $3 RETURNING *',
            [id, chain, address]
        );
        res.json({ success: true, wallet: result.rows[0] });
    } catch (e) {
        console.error(`[Wallet] ❌ Failed to link wallet:`, e);
        res.status(500).json({ error: 'Wallet link failed' });
    }
});

// 5. Leaderboard
let leaderboardCache = {
    data: null as any,
    lastUpdated: 0
};

app.get('/leaderboard', authenticateTelegram, async (req: any, res) => {
    const { id } = req.user;
    const now = Date.now();

    try {
        // 1. Get Top 50 (Cached for 5s)
        if (!leaderboardCache.data || (now - leaderboardCache.lastUpdated > 5000)) {
            const top50Res = await query(`
                SELECT username, points 
                FROM users 
                ORDER BY points DESC 
                LIMIT 50
            `);
            leaderboardCache.data = top50Res.rows;
            leaderboardCache.lastUpdated = now;
        }

        // 2. Get Current User Rank (Real-time)
        // We still fetch this real-time so the user sees their own progress instantly
        const userRes = await query('SELECT points FROM users WHERE telegram_id = $1', [id]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });

        const userPoints = userRes.rows[0].points;
        const rankRes = await query('SELECT COUNT(*) as older FROM users WHERE points > $1', [userPoints]);
        const rank = parseInt(rankRes.rows[0].older) + 1;

        res.json({
            topUsers: leaderboardCache.data,
            currentUser: {
                rank,
                points: userPoints,
                username: req.user.username
            }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Leaderboard failed' });
    }
});

// ==================== MISBOT TOKEN ENDPOINTS ====================

// Get MISBOT balance
app.get('/misbot-balance', authenticateTelegram, async (req: any, res: any) => {
    try {
        const { tonAddress } = req.query;

        if (!tonAddress) {
            return res.status(400).json({ error: 'TON address required' });
        }

        const balance = await getMisbotBalance(tonAddress as string);
        res.json({ balance });
    } catch (error: any) {
        console.error('Failed to get MISBOT balance:', error);
        res.status(500).json({ error: 'Failed to get balance' });
    }
});

// Get total MISBOT supply
app.get('/misbot-supply', async (req, res) => {
    try {
        const totalSupply = await getTotalSupply();
        res.json({ totalSupply });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get supply' });
    }
});

// Claim MISBOT tokens
app.post('/claim-misbot', authenticateTelegram, async (req: any, res: any) => {
    const { id } = req.user;
    const { tonAddress, coinsToExchange } = req.body;

    // Validate input
    if (!tonAddress) {
        return res.status(400).json({ error: 'TON address required' });
    }

    if (!coinsToExchange || coinsToExchange < 1000 || coinsToExchange % 1000 !== 0) {
        return res.status(400).json({
            error: 'Must exchange multiples of 1000 coins'
        });
    }

    try {
        // Check user has enough coins
        const userResult = await query(
            'SELECT points FROM users WHERE telegram_id = $1',
            [id]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const points = Number(userResult.rows[0].points);
        if (points < coinsToExchange) {
            return res.status(400).json({
                error: `Not enough coins. You have ${points}, need ${coinsToExchange}`
            });
        }

        // Calculate MISBOT amount (1000 coins = 1 MISBOT)
        const misbotAmount = coinsToExchange / 1000;

        // Mint MISBOT tokens
        const mintResult = await mintMisbotTokens(tonAddress, misbotAmount);

        if (!mintResult.success) {
            return res.status(500).json({
                error: mintResult.error || 'Failed to mint tokens'
            });
        }

        // Deduct coins from user
        await query(
            'UPDATE users SET points = points - $1 WHERE telegram_id = $2',
            [coinsToExchange, id]
        );

        // Record claim in database
        await query(
            `INSERT INTO misbot_claims 
             (telegram_id, ton_address, coins_spent, misbot_amount, status)
             VALUES ($1, $2, $3, $4, 'completed')`,
            [id, tonAddress, coinsToExchange, misbotAmount.toString()]
        );

        res.json({
            success: true,
            misbotAmount,
            coinsSpent: coinsToExchange,
            message: `Successfully minted ${misbotAmount} MISBOT!`
        });
    } catch (error: any) {
        console.error('Claim MISBOT error:', error);
        res.status(500).json({ error: 'Failed to process claim' });
    }
});

// Get user's MISBOT claim history
app.get('/misbot-history', authenticateTelegram, async (req: any, res: any) => {
    try {
        const { id } = req.user;

        const result = await query(
            `SELECT * FROM misbot_claims 
             WHERE telegram_id = $1 
             ORDER BY created_at DESC 
             LIMIT 50`,
            [id]
        );

        res.json({ claims: result.rows });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get history' });
    }
});

// --- Centralized Error Handler ---
app.use((err: any, req: any, res: any, next: any) => {
    console.error('[Error]', err);

    // Don't leak error details in production
    if (process.env.NODE_ENV === 'production') {
        res.status(err.status || 500).json({ error: 'Internal server error' });
    } else {
        res.status(err.status || 500).json({
            error: err.message || 'Internal server error',
            stack: err.stack
        });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ Backend running on port ${PORT}`);
    console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`✅ CORS allowed origins: ${allowedOrigins.join(', ')}`);
});
