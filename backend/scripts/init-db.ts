import fs from 'fs';
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

        const sqlPath = path.join(__dirname, '../../database/init.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing database initialization...');
        await pool.query(sql);
        console.log('Database initialized successfully!');

        await pool.end();
    } catch (error: any) {
        if (error.code === '42710') {
            console.log('Database already initialized (types exist).');
        } else {
            console.error('Error initializing database:', error);
            process.exit(1);
        }
    }
};

run();
