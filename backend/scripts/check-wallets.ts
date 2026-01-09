import dotenv from 'dotenv';
import { query } from '../src/db';
dotenv.config();

const run = async () => {
    try {
        console.log("\n=== USERS TABLE ===");
        const users = await query('SELECT telegram_id, username, points FROM users ORDER BY points DESC LIMIT 5');
        console.table(users.rows);

        console.log("\n=== WALLETS TABLE ===");
        const wallets = await query('SELECT * FROM wallets ORDER BY created_at DESC');
        console.log(`Total wallets in database: ${wallets.rows.length}`);
        if (wallets.rows.length > 0) {
            console.table(wallets.rows);
        } else {
            console.log("⚠️  WALLETS TABLE IS EMPTY - No wallets have been linked!");
        }

        console.log("\n=== JOINED VIEW ===");
        const joined = await query(`
            SELECT 
                u.telegram_id, 
                u.username, 
                u.points,
                w.address,
                w.created_at as wallet_linked_at
            FROM users u
            LEFT JOIN wallets w ON u.telegram_id = w.telegram_id
            ORDER BY u.points DESC
            LIMIT 5
        `);
        console.table(joined.rows);

        process.exit(0);
    } catch (e) {
        console.error("Database Error:", e);
        process.exit(1);
    }
};

run();
