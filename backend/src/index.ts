import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { verifyTelegramWebAppData, parseUserData } from './utils/telegramAuth';
import { query } from './db';

dotenv.config();

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

// --- Middleware ---
const authenticateTelegram = (req: any, res: any, next: any) => {
    const initData = req.headers['x-telegram-init-data'];
    if (!initData) return res.status(401).json({ error: 'Missing initData' });

    try {
        const isValid = verifyTelegramWebAppData(initData as string);
        if (!isValid) return res.status(403).json({ error: 'Invalid initData signature' });

        const user = parseUserData(initData as string);
        req.user = user;
        next();
    } catch (e) {
        return res.status(403).json({ error: 'Auth failed' });
    }
};

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

// 2. Tap (Core Game Loop)
app.post('/tap', authenticateTelegram, async (req: any, res) => {
    const { id } = req.user;
    const { count } = req.body; // e.g. user claims they tapped 5 times since last sync

    // Basic Validation
    if (!count || count <= 0 || count > 100) return res.status(400).json({ error: 'Invalid tap count' });

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
app.post('/connect-wallet', authenticateTelegram, async (req: any, res) => {
    const { id } = req.user;
    const { chain, address } = req.body;

    if (!['ETH', 'XRP', 'TON'].includes(chain)) return res.status(400).json({ error: 'Invalid chain' });
    if (!address) return res.status(400).json({ error: 'Address required' });

    try {
        // TODO: Verify signature here to prove ownership of address
        // For MVP/Demo, we accept the address.

        await query(
            'INSERT INTO wallets (telegram_id, chain, address) VALUES ($1, $2, $3) ON CONFLICT (telegram_id, chain) DO UPDATE SET address = $3',
            [id, chain, address]
        );
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Wallet link failed' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});
