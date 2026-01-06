-- Database Initialization for Misbot

CREATE TABLE IF NOT EXISTS users (
    telegram_id BIGINT PRIMARY KEY,
    username VARCHAR(255),
    points BIGINT DEFAULT 0,
    energy INT DEFAULT 1000,
    max_energy INT DEFAULT 1000,
    last_tap_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TYPE chain_type AS ENUM ('ETH', 'XRP', 'TON');

CREATE TABLE IF NOT EXISTS wallets (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT REFERENCES users(telegram_id),
    chain chain_type NOT NULL,
    address VARCHAR(255) NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(telegram_id, chain)
);

CREATE TABLE IF NOT EXISTS claims (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT REFERENCES users(telegram_id),
    chain chain_type NOT NULL,
    amount BIGINT NOT NULL,
    tx_hash VARCHAR(255),
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tap_logs (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT REFERENCES users(telegram_id),
    tap_count INT NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster leaderboards or lookups
CREATE INDEX IF NOT EXISTS idx_users_points ON users(points DESC);
