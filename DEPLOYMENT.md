# Deployment Guide - Misbot (Web3 Tap-to-Earn)

This guide covers setting up the PostgreSQL database, deploying Smart Contracts to testnets, and running the Frontend/Backend services.

## 1. Database Setup (PostgreSQL)

You need a PostgreSQL instance. You can run one locally via Docker:

```bash
docker run --name misbot-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

Initialize the schema:
```bash
psql -h localhost -U postgres -f database/init.sql
```

## 2. Backend Setup (Node.js)

1. Navigate to backend: `cd backend`
2. Install dependencies: `npm install`
3. Configure Environment:
   Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL`: `postgresql://postgres:password@localhost:5432/misbot`
   - `BOT_TOKEN`: Get this from @BotFather in Telegram.
   - `ETH_PRIVATE_KEY`: Your Sepolia private key (for verifying claims).
   - `XRP_SEED`: Your XRPL Testnet seed.
   - `TON_MNEMONIC`: Your TON Testnet wallet mnemonic.

4. Run Server:
   ```bash
   npm run dev
   ```
   Server will start on `http://localhost:3001`.

## 3. Frontend Setup (Next.js)

1. Navigate to frontend: `cd frontend`
2. Install dependencies: `npm install`
3. Configure Environment:
   Copy `.env.example` to `.env.local` or just `.env`:
   - `NEXT_PUBLIC_API_URL`: `http://localhost:3001` (or your ngrok URL for real device testing).
   - `NEXT_PUBLIC_BOT_USERNAME`: Your bot's username.

4. Run App:
   ```bash
   npm run dev
   ```
   App will start on `http://localhost:3000`.

## 4. Telegram Integration

1. Create a Bot via @BotFather.
2. Create a **New App** attached to that bot.
3. Set the **Menu Button URL** to your hosted frontend URL (must be HTTPS! Use `ngrok http 3000` for local dev).

## 5. Smart Contracts

### Ethereum (Sepolia)
Deploy `MisToken.sol` and `MisClaim.sol`:
```bash
# Use Remix or Hardhat
# 1. Deploy Token
# 2. Deploy Claim(TokenAddress, BackendSignerAddress)
# 3. Call Token.transferOwnership(ClaimAddress) OR mint tokens to ClaimAddress.
```

### TON (Testnet)
Use Blueprint or manually deploy via scripts:
```bash
# Example logic in contracts/ton/
# Real deployment requires ton-cli or blueprint
```

### XRP (Testnet)
Run the issuance script to setup the Issuer and Hot Wallet:
```bash
cd contracts/xrp
node issueToken.js
```
