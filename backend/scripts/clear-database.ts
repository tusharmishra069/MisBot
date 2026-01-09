import dotenv from 'dotenv';
import { query } from '../src/db';
dotenv.config();

const clearDatabase = async () => {
    try {
        console.log("⚠️  WARNING: This will delete ALL data from the database!");
        console.log("Starting database cleanup...\n");

        // Delete in order due to foreign key constraints
        console.log("1. Deleting tap_logs...");
        const tapLogs = await query('DELETE FROM tap_logs');
        console.log(`   ✅ Deleted ${tapLogs.rowCount} tap logs`);

        console.log("2. Deleting claims...");
        const claims = await query('DELETE FROM claims');
        console.log(`   ✅ Deleted ${claims.rowCount} claims`);

        console.log("3. Deleting wallets...");
        const wallets = await query('DELETE FROM wallets');
        console.log(`   ✅ Deleted ${wallets.rowCount} wallets`);

        console.log("4. Deleting users...");
        const users = await query('DELETE FROM users');
        console.log(`   ✅ Deleted ${users.rowCount} users`);

        console.log("\n✅ Database cleared successfully!");
        console.log("All tables are now empty. Ready for fresh start.");

        // Verify
        const check = await query('SELECT COUNT(*) FROM users');
        console.log(`\nVerification: ${check.rows[0].count} users in database`);

        process.exit(0);
    } catch (e) {
        console.error("❌ Error clearing database:", e);
        process.exit(1);
    }
};

clearDatabase();
