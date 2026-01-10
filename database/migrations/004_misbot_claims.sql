-- MISBOT Token Claims Table
CREATE TABLE IF NOT EXISTS misbot_claims (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL,
    ton_address VARCHAR(255) NOT NULL,
    coins_spent BIGINT NOT NULL,
    misbot_amount VARCHAR(50) NOT NULL,
    tx_hash VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_misbot_claims_telegram_id ON misbot_claims(telegram_id);
CREATE INDEX IF NOT EXISTS idx_misbot_claims_status ON misbot_claims(status);
CREATE INDEX IF NOT EXISTS idx_misbot_claims_created_at ON misbot_claims(created_at DESC);

-- Add comment
COMMENT ON TABLE misbot_claims IS 'Tracks MISBOT token claims - users exchange game coins for MISBOT tokens';
