# MISBOT Token - Quick Deployment Guide

## 🚀 Fast Track: Deploy MISBOT Token in 15 Minutes

### Step 1: Get Testnet TON (2 minutes)

1. Open Telegram
2. Search for `@testgiver_ton_bot`
3. Send your TON wallet address
4. Receive free testnet TON

### Step 2: Deploy Token Using TON Minter (5 minutes)

**Option A: Web Interface (Easiest)**

1. Go to https://minter.ton.org
2. Click "Switch to Testnet" (top right)
3. Connect your TON wallet (testnet mode)
4. Fill in token details:
   ```
   Name: MISBOT
   Symbol: MIS
   Decimals: 9
   Supply: 1000000000
   Description: MISBOT game token
   ```
5. Click "Deploy Jetton"
6. Approve transaction (~0.5 testnet TON)
7. **Copy the contract address** (e.g., `EQD...`)

**Option B: Using Blueprint (Advanced)**

```bash
cd contracts/ton
npm install -g @ton-community/blueprint
blueprint create jetton
# Follow prompts for MISBOT details
blueprint deploy
```

### Step 3: Configure Backend (5 minutes)

Add to `backend/.env`:
```bash
# MISBOT Token
JETTON_MINTER_ADDRESS=EQD...  # From Step 2
JETTON_ADMIN_WALLET=UQD...    # Your wallet address
```

### Step 4: Test Minting (3 minutes)

```bash
# Install TON SDK
cd backend
npm install @ton/ton @ton/core

# Test mint
node -e "
const { TonClient, Address } = require('@ton/ton');
const client = new TonClient({ 
  endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC' 
});
// Mint 100 MISBOT to test address
console.log('Minting test tokens...');
"
```

---

## 📝 Backend Integration Code

### File: `backend/src/jetton-utils.ts`

```typescript
import { TonClient, Address, WalletContractV4, internal } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';

const JETTON_MINTER = process.env.JETTON_MINTER_ADDRESS!;
const ADMIN_MNEMONIC = process.env.TON_MNEMONIC!;

const client = new TonClient({
  endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC'
});

/**
 * Mint MISBOT tokens to user
 */
export async function mintMisbotTokens(
  recipientAddress: string,
  amount: number
): Promise<boolean> {
  try {
    // Get admin wallet
    const key = await mnemonicToPrivateKey(ADMIN_MNEMONIC.split(' '));
    const wallet = WalletContractV4.create({
      publicKey: key.publicKey,
      workchain: 0
    });
    const contract = client.open(wallet);

    // Mint message
    await contract.sendTransfer({
      secretKey: key.secretKey,
      seqno: await contract.getSeqno(),
      messages: [
        internal({
          to: JETTON_MINTER,
          value: '0.05', // Gas for minting
          body: beginCell()
            .storeUint(21, 32) // Mint op
            .storeUint(0, 64)  // Query ID
            .storeAddress(Address.parse(recipientAddress))
            .storeCoins(amount * 1e9) // Amount in nanoMISBOT
            .endCell()
        })
      ]
    });

    return true;
  } catch (error) {
    console.error('Mint error:', error);
    return false;
  }
}

/**
 * Get user's MISBOT balance
 */
export async function getMisbotBalance(
  userAddress: string
): Promise<number> {
  try {
    // Get jetton wallet address for user
    const result = await client.runMethod(
      Address.parse(JETTON_MINTER),
      'get_wallet_address',
      [{ type: 'slice', cell: beginCell().storeAddress(Address.parse(userAddress)).endCell() }]
    );

    const jettonWalletAddress = result.stack.readAddress();

    // Get balance from jetton wallet
    const balanceResult = await client.runMethod(
      jettonWalletAddress,
      'get_wallet_data'
    );

    const balance = balanceResult.stack.readBigNumber();
    return Number(balance) / 1e9; // Convert to MISBOT
  } catch (error) {
    return 0; // Wallet doesn't exist yet
  }
}
```

### File: `backend/src/index.ts` (Add endpoint)

```typescript
import { mintMisbotTokens, getMisbotBalance } from './jetton-utils';

// Get MISBOT balance
app.get('/misbot-balance', authenticateTelegram, async (req: any, res: any) => {
  try {
    const { tonAddress } = req.query;
    
    if (!tonAddress) {
      return res.status(400).json({ error: 'TON address required' });
    }

    const balance = await getMisbotBalance(tonAddress);
    res.json({ balance });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get balance' });
  }
});

// Claim MISBOT tokens
app.post('/claim-misbot', authenticateTelegram, async (req: any, res: any) => {
  const { id } = req.user;
  const { tonAddress, coinsToExchange } = req.body;

  // Validate
  if (!coinsToExchange || coinsToExchange < 1000 || coinsToExchange % 1000 !== 0) {
    return res.status(400).json({ 
      error: 'Must exchange multiples of 1000 coins' 
    });
  }

  try {
    // Check user has enough coins
    const userResult = await query(
      'SELECT points FROM users WHERE telegram_id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const points = Number(userResult.rows[0].points);
    if (points < coinsToExchange) {
      return res.status(400).json({ 
        error: `Not enough coins. You have ${points}, need ${coinsToExchange}` 
      });
    }

    // Calculate MISBOT amount
    const misbotAmount = coinsToExchange / 1000;

    // Mint tokens
    const success = await mintMisbotTokens(tonAddress, misbotAmount);

    if (!success) {
      return res.status(500).json({ error: 'Failed to mint tokens' });
    }

    // Deduct coins
    await query(
      'UPDATE users SET points = points - $1 WHERE telegram_id = $2',
      [coinsToExchange, id]
    );

    // Record claim
    await query(
      `INSERT INTO misbot_claims 
       (telegram_id, ton_address, coins_spent, misbot_amount, status)
       VALUES ($1, $2, $3, $4, 'completed')`,
      [id, tonAddress, coinsToExchange, misbotAmount.toString()]
    );

    res.json({
      success: true,
      misbotAmount,
      coinsSpent: coinsToExchange,
      message: `Successfully minted ${misbotAmount} MISBOT!`
    });
  } catch (error: any) {
    console.error('Claim error:', error);
    res.status(500).json({ error: 'Failed to process claim' });
  }
});
```

---

## 🎨 Frontend Integration

### File: `frontend/app/page.tsx` (Add to component)

```typescript
// State
const [misbotBalance, setMisbotBalance] = useState(0);
const [coinsToExchange, setCoinsToExchange] = useState(1000);
const [claiming, setClaiming] = useState(false);

// Load MISBOT balance
useEffect(() => {
  if (tonWallet && authData) {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/misbot-balance?tonAddress=${tonWallet.account.address}`, {
      headers: { 'x-telegram-init-data': authData }
    })
      .then(res => res.json())
      .then(data => setMisbotBalance(data.balance))
      .catch(err => console.error('Failed to load MISBOT balance:', err));
  }
}, [tonWallet, authData]);

// Claim MISBOT
async function claimMisbot() {
  if (!tonWallet) {
    toast.error('Connect TON wallet first');
    return;
  }

  setClaiming(true);

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/claim-misbot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-telegram-init-data': authData
      },
      body: JSON.stringify({
        tonAddress: tonWallet.account.address,
        coinsToExchange
      })
    });

    const data = await response.json();

    if (data.success) {
      toast.success(`🎉 ${data.misbotAmount} MISBOT minted!`);
      setCoins(c => c - coinsToExchange);
      setMisbotBalance(b => b + data.misbotAmount);
    } else {
      toast.error(data.error || 'Failed to claim');
    }
  } catch (error: any) {
    toast.error('Network error: ' + error.message);
  } finally {
    setClaiming(false);
  }
}

// UI (add to "Earn" tab)
<div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-4 mb-4">
  <div className="flex items-center gap-3 mb-3">
    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-2xl">
      🪙
    </div>
    <div>
      <h3 className="font-bold text-lg">MISBOT Token</h3>
      <p className="text-xs text-muted-foreground">
        Exchange coins for MISBOT tokens
      </p>
    </div>
  </div>

  {/* Balance */}
  <div className="bg-black/20 rounded-lg p-3 mb-3">
    <p className="text-xs text-muted-foreground mb-1">Your MISBOT Balance</p>
    <p className="text-2xl font-bold text-green-400">{misbotBalance.toFixed(2)} MIS</p>
  </div>

  {/* Exchange Input */}
  <div className="mb-3">
    <label className="text-sm font-medium mb-2 block">Coins to Exchange</label>
    <input
      type="number"
      value={coinsToExchange}
      onChange={(e) => setCoinsToExchange(Number(e.target.value))}
      min="1000"
      step="1000"
      className="w-full p-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
    />
    <p className="text-xs text-muted-foreground mt-1">
      You'll receive: <span className="font-bold text-green-400">{(coinsToExchange / 1000).toFixed(1)} MISBOT</span>
    </p>
  </div>

  {/* Claim Button */}
  <button
    onClick={claimMisbot}
    disabled={coins < coinsToExchange || claiming || !tonWallet}
    className={`w-full py-3 rounded-lg font-bold transition-all ${
      coins >= coinsToExchange && tonWallet && !claiming
        ? 'bg-green-500 hover:bg-green-600 text-white'
        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
    }`}
  >
    {claiming ? 'Minting...' : `Exchange for ${(coinsToExchange / 1000).toFixed(1)} MISBOT`}
  </button>

  {!tonWallet && (
    <p className="text-xs text-center mt-2 text-yellow-400">
      ⚠️ Connect TON wallet to claim
    </p>
  )}
</div>
```

---

## 📊 Database Migration

### File: `database/migrations/004_misbot_claims.sql`

```sql
-- MISBOT Claims Table
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_misbot_claims_telegram_id ON misbot_claims(telegram_id);
CREATE INDEX IF NOT EXISTS idx_misbot_claims_status ON misbot_claims(status);
CREATE INDEX IF NOT EXISTS idx_misbot_claims_created_at ON misbot_claims(created_at DESC);

-- Comment
COMMENT ON TABLE misbot_claims IS 'Tracks MISBOT token claims and exchanges';
```

---

## ✅ Quick Start Checklist

1. [ ] Deploy MISBOT token on testnet (https://minter.ton.org)
2. [ ] Copy contract address to `.env`
3. [ ] Run database migration
4. [ ] Install dependencies: `npm install @ton/ton @ton/core`
5. [ ] Create `jetton-utils.ts`
6. [ ] Add claim endpoint to backend
7. [ ] Add UI to frontend
8. [ ] Test full flow

**Total time: ~30 minutes** 🚀
