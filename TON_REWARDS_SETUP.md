# 🚀 TON Testnet Rewards - Quick Setup Guide

## What You Built

Users can now claim **1 TON coin** (testnet) when they mine 1000 coins in your game!

## Setup Steps

### 1. Create TON Wallet

**Option A: Use TON Wallet App**
1. Download TON Wallet: https://ton.org/wallets
2. Create new wallet
3. **SAVE YOUR 24-WORD MNEMONIC** (you'll need this!)

**Option B: Generate Online**
1. Go to: https://mnemonic.ton.org
2. Generate 24-word mnemonic
3. **SAVE IT SECURELY**

### 2. Get Testnet TON

1. Open Telegram
2. Search for `@testgiver_ton_bot`
3. Send your wallet address
4. Receive free testnet TON (you need ~10-20 TON for testing)

### 3. Configure Backend

Add to `backend/.env`:

```bash
# TON Rewards Configuration
TON_MNEMONIC=word1 word2 word3 word4 ... word24
TON_NETWORK=testnet
```

### 4. Run Database Migration

```bash
cd database
psql $DATABASE_URL -f migrations/002_ton_rewards.sql
```

Or if using Render/Neon, run the SQL directly in their console:

```sql
CREATE TABLE IF NOT EXISTS ton_rewards (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT NOT NULL,
    ton_address VARCHAR(255) NOT NULL,
    amount VARCHAR(50) NOT NULL,
    tx_hash VARCHAR(255),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ton_rewards_telegram_id ON ton_rewards(telegram_id);
CREATE INDEX IF NOT EXISTS idx_ton_rewards_status ON ton_rewards(status);
CREATE INDEX IF NOT EXISTS idx_ton_rewards_created_at ON ton_rewards(created_at DESC);
```

### 5. Restart Backend

```bash
cd backend
npm run dev
```

You should see:
```
✅ Database Connected Successfully
✅ Database Optimized: Indexes Verified
✅ TON Wallet initialized (testnet)
📍 Wallet address: EQD...
✅ Backend running on port 3001
```

### 6. Test It!

1. **Mine 1000 coins** in the game
2. **Connect TON wallet** (click "Connect TON" button)
3. **Go to "Earn" tab**
4. **Click "Claim 1 TON"**
5. **Check your wallet** - you should receive 1 TON!

## How It Works

```
User mines 1000 coins
       ↓
Clicks "Claim 1 TON" in Earn tab
       ↓
Frontend calls /claim-ton-reward
       ↓
Backend validates:
  - User has 1000+ points ✓
  - Wallet is connected ✓
  - Not claimed in last 24h ✓
       ↓
Backend sends 1 TON from its wallet
       ↓
User receives TON!
Points reduced by 1000
```

## Important Notes

### ⚠️ Testnet vs Mainnet

**Currently using TESTNET:**
- Free test coins
- No real value
- Perfect for testing

**To switch to MAINNET later:**
1. Change `TON_NETWORK=mainnet` in `.env`
2. Fund your wallet with REAL TON
3. Each reward costs ~1.01 TON ($2-3 USD)

### 🔒 Security

- **NEVER commit `.env` file** (it contains your mnemonic!)
- **Keep mnemonic secret** (anyone with it can steal your TON)
- **Use separate wallet** for rewards (don't use your personal wallet)

### 💰 Cost Estimate

**Testnet:** FREE (unlimited test coins)

**Mainnet (future):**
- 1 reward = 1.01 TON (~$2-3 USD)
- 100 users = 101 TON (~$200-300 USD)
- 1000 users = 1010 TON (~$2000-3000 USD)

### 🎯 Rate Limits

- **1 claim per user per 24 hours**
- **1000 points required per claim**
- **Prevents spam and abuse**

## Troubleshooting

### "TON wallet not initialized"

**Problem:** Backend can't load wallet

**Solutions:**
1. Check `TON_MNEMONIC` is set in `.env`
2. Verify mnemonic is 24 words separated by spaces
3. Restart backend

### "Not enough points"

**Problem:** User has < 1000 coins

**Solution:** Mine more coins!

### "Already claimed in last 24 hours"

**Problem:** User already claimed recently

**Solution:** Wait 24 hours or remove the time limit in `ton-rewards.ts`

### "Invalid TON address"

**Problem:** Wallet address is malformed

**Solution:** Reconnect TON wallet

## Monitoring

### Check Wallet Balance

```bash
# Install TON CLI
npm install -g @ton/cli

# Check balance
ton-cli account <your_wallet_address>
```

### View Transactions

**Testnet Explorer:**
https://testnet.tonscan.org/address/<your_wallet_address>

**Mainnet Explorer:**
https://tonscan.org/address/<your_wallet_address>

### Database Queries

```sql
-- View all rewards
SELECT * FROM ton_rewards ORDER BY created_at DESC LIMIT 10;

-- Count successful claims
SELECT COUNT(*) FROM ton_rewards WHERE status = 'completed';

-- Total TON distributed
SELECT SUM(amount::numeric) FROM ton_rewards WHERE status = 'completed';
```

## Next Steps

1. **Test thoroughly** on testnet
2. **Monitor for bugs**
3. **Adjust reward amount** if needed (in `ton-rewards.ts`)
4. **Consider mainnet** when ready for production
5. **Add analytics** to track claim rates

## Support

- **TON Documentation:** https://docs.ton.org
- **TON Dev Chat:** https://t.me/tondev_eng
- **Testnet Faucet:** https://t.me/testgiver_ton_bot

---

**Congratulations!** 🎉 Your game now has real cryptocurrency rewards!
