import dotenv from 'dotenv';
import { query } from '../src/db';
dotenv.config();

const testWalletInsert = async () => {
    try {
        console.log("Testing wallet insertion...");

        // Test with the top user (hacker290120, ID: 821522786)
        const testAddress = 'UQTest_Manual_Insert_12345';

        const result = await query(
            `INSERT INTO wallets (telegram_id, chain, address) 
             VALUES ($1, $2, $3) 
             ON CONFLICT (telegram_id, chain) 
             DO UPDATE SET address = $3 
             RETURNING *`,
            [821522786, 'TON', testAddress]
        );

        console.log("✅ Wallet inserted successfully:");
        console.table(result.rows);

        // Verify it's there
        const check = await query('SELECT * FROM wallets');
        console.log("\nAll wallets in database:");
        console.table(check.rows);

        process.exit(0);
    } catch (e) {
        console.error("❌ Failed to insert wallet:", e);
        process.exit(1);
    }
};

testWalletInsert();
