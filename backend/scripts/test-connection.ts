import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env file which is in the parent directory relative to this script
dotenv.config({ path: path.join(__dirname, '../.env') });

const run = async () => {
    try {
        if (!process.env.DATABASE_URL) {
            throw new Error('DATABASE_URL is not defined in .env');
        }

        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        });

        console.log('Connecting to database...');
        const res = await pool.query('SELECT NOW() as now');
        console.log('Connected successfully!');
        console.log('Database Time:', res.rows[0].now);

        await pool.end();
    } catch (error) {
        console.error('Connection failed:', error);
        process.exit(1);
    }
};

run();
