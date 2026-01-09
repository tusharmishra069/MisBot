
import dotenv from 'dotenv';
import { query } from '../src/db';
dotenv.config();

const run = async () => {
    try {
        console.log("--- Checking Database Content ---");

        // Join Users and Wallets to show the full picture
        const res = await query(`
            SELECT 
                u.telegram_id, 
                u.username, 
                u.points, 
                w.address as wallet_address 
            FROM users u
            LEFT JOIN wallets w ON u.telegram_id = w.telegram_id
            ORDER BY u.points DESC
            LIMIT 10
        `);

        if (res.rows.length === 0) {
            console.log("No users found.");
        } else {
            console.table(res.rows.map(r => ({
                ID: r.telegram_id,
                User: r.username,
                Points: r.points,
                Wallet: r.wallet_address ? r.wallet_address.substring(0, 15) + '...' : 'NOT LINKED'
            })));
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
