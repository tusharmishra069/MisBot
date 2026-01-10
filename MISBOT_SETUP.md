# 🚀 MISBOT Token - Quick Setup

## ✅ What's Ready

I've implemented all the code for MISBOT token integration:

### Backend ✅
- `jetton-utils.ts` - Minting and balance checking
- API endpoints: `/claim-misbot`, `/misbot-balance`, `/misbot-history`
- Database migration: `004_misbot_claims.sql`
- Dependencies installed: `@ton/ton`, `@ton/core`

### Frontend ✅
- MISBOT balance display
- Exchange UI in "Earn" tab
- Real-time balance updates
- Exchange rate: 1000 coins = 1 MISBOT

---

## 📋 What You Need to Do

### Step 1: Deploy MISBOT Token (5 minutes)

1. **Go to https://minter.ton.org**
2. **Switch to Testnet** (toggle in top right)
3. **Connect your TON wallet** (testnet mode)
4. **Fill in token details:**
   ```
   Name: MISBOT
   Symbol: MIS
   Decimals: 9
   Total Supply: 1000000000
   Description: MISBOT game reward token
   Image: (optional - upload a logo)
   ```
5. **Click "Deploy Jetton"**
6. **Approve transaction** (~0.5 testnet TON)
7. **COPY THE CONTRACT ADDRESS** (looks like `EQD...`)

### Step 2: Configure Backend (2 minutes)

Add to `backend/.env`:

```bash
# MISBOT Jetton Token
JETTON_MINTER_ADDRESS=EQD...  # Paste address from Step 1
```

### Step 3: Run Database Migration (1 minute)

```bash
# If using local PostgreSQL
psql $DATABASE_URL -f database/migrations/004_misbot_claims.sql

# If using Render/Neon, run this SQL in their console:
```

```sql
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

CREATE INDEX IF NOT EXISTS idx_misbot_claims_telegram_id ON misbot_claims(telegram_id);
CREATE INDEX IF NOT EXISTS idx_misbot_claims_status ON misbot_claims(status);
CREATE INDEX IF NOT EXISTS idx_misbot_claims_created_at ON misbot_claims(created_at DESC);
```

### Step 4: Restart Backend (1 minute)

```bash
cd backend
npm run dev
```

You should see:
```
✅ Database Connected Successfully
✅ TON Wallet initialized (testnet)
✅ TON Client initialized (testnet)
✅ Backend running on port 3001
```

### Step 5: Test! (2 minutes)

1. Open your app
2. Mine 1000+ coins
3. Connect TON wallet
4. Go to "Earn" tab
5. See MISBOT Token card
6. Enter coins to exchange (e.g., 1000)
7. Click "Exchange for 1 MISBOT"
8. Check your wallet - you should have MISBOT tokens!

---

## 🎨 What You'll See

### In the App:

**Earn Tab - MISBOT Card:**
```
🪙 MISBOT Token
Exchange coins for MISBOT tokens

Your MISBOT Balance
0.00 MIS

Coins to Exchange
[1000]
You'll receive: 1.0 MISBOT

[Exchange for 1.0 MISBOT]
```

### In Your Wallet:

After claiming, you'll see:
- MISBOT (MIS) token
- Balance: 1.0 MIS (or however much you claimed)
- Can send to other wallets
- Visible on testnet explorer

---

## 🔍 Verify on Blockchain

After claiming, check:

**Testnet Explorer:**
https://testnet.tonscan.org/address/YOUR_WALLET_ADDRESS

You'll see:
- MISBOT token balance
- Transaction history
- Minting events

---

## 💡 Exchange Rate

| Game Coins | MISBOT Tokens |
|-----------|---------------|
| 1,000 | 1 MIS |
| 5,000 | 5 MIS |
| 10,000 | 10 MIS |
| 100,000 | 100 MIS |

---

## 🐛 Troubleshooting

### "Jetton minter address not configured"
- Add `JETTON_MINTER_ADDRESS` to `backend/.env`
- Restart backend

### "Failed to mint tokens"
- Check backend wallet has testnet TON
- Verify minter address is correct
- Check backend logs for errors

### "Not enough coins"
- Mine more coins in the game
- Need at least 1000 coins

### Balance shows 0 after claiming
- Wait 10-20 seconds for blockchain confirmation
- Refresh the page
- Check testnet explorer

---

## 📊 Admin Commands

### Check Total Supply
```bash
curl http://localhost:3001/misbot-supply
```

### Check User Balance
```bash
curl "http://localhost:3001/misbot-balance?tonAddress=UQD..."
```

---

## 🎉 Success Checklist

- [ ] Token deployed on minter.ton.org
- [ ] Contract address added to `.env`
- [ ] Database migration run
- [ ] Backend restarted successfully
- [ ] Can see MISBOT card in app
- [ ] Successfully exchanged coins for MISBOT
- [ ] Tokens visible in wallet
- [ ] Can see on testnet explorer

---

## 🚀 Next Steps

Once everything works:

1. **Test with multiple users**
2. **Adjust exchange rate** if needed (change in code)
3. **Add more features:**
   - Leaderboard for MISBOT holders
   - Staking mechanism
   - Special rewards for holders
4. **Consider mainnet** when ready for production

---

**Need help?** Check the logs:
```bash
# Backend logs
cd backend
npm run dev

# Look for:
✅ TON Client initialized
✅ Minted X MISBOT to address...
```

Good luck! 🎉
