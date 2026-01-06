# Deployment Guide (Production)

This guide explains how to deploy each component of **Misbot** independently.

---

## 1. 🗄 Database Deployment (PostgreSQL)

**Recommended Provider:** [Neon.tech](https://neon.tech) (Free Tier) or [Railway](https://railway.app).

1.  Create a new Postgres project.
2.  Copy the **Connection String** (e.g., `postgres://user:pass@ep-xyz.aws.neon.tech/neondb?sslmode=require`).
3.  Run the initialization script from your local machine:
    ```bash
    psql "postgres://user:pass@ep-xyz.../neondb" -f database/init.sql
    ```
    *This creates the `users`, `wallets`, and `claims` tables in the cloud DB.*

---

## 2. ⚙️ Backend Deployment (Node.js)

**Recommended Provider:** [Render.com](https://render.com) or [Railway](https://railway.app).

1.  Push your code to GitHub.
2.  Create a **New Web Service** connected to your repo.
3.  **Root Directory**: `backend`
4.  **Build Command**: `npm install && npm run build`
5.  **Start Command**: `npm start`
6.  **Environment Variables**:
    Add these in the provider's dashboard:
    *   `DATABASE_URL`: (The string from Step 1)
    *   `BOT_TOKEN`: (From BotFather)
    *   `ETH_PRIVATE_KEY`: (Your Signer Key)
    *   `PORT`: `10000` (or whatever Render assigns)
7.  **Deploy**. Copy the provided URL (e.g., `https://misbot-backend.onrender.com`).

---

## 3. 🖥 Frontend Deployment (Next.js)

**Recommended Provider:** [Vercel](https://vercel.com).

1.  Push code to GitHub.
2.  Import project into Vercel.
3.  **Root Directory**: `frontend`
4.  **Framework Preset**: Next.js (Default).
5.  **Environment Variables**:
    *   `NEXT_PUBLIC_API_URL`: The URL from Step 2 (e.g., `https://misbot-backend.onrender.com`).
    *   `NEXT_PUBLIC_BOT_USERNAME`: Your bot's username.
    *   `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: via Reown/WalletConnect.
6.  **Deploy**.
7.  **Final Step**: Go to BotFather -> `/mybots` -> Menu Button -> Set URL to your new Vercel domain (e.g., `https://misbot.vercel.app`).

---

## 4. 🔗 Smart Contract Deployment

### Ethereum (Sepolia)
*   **Tool**: [Remix IDE](https://remix.ethereum.org).
*   **Files**: Copy `contracts/eth/*.sol` to Remix.
*   **Deploy**:
    1.  Compile `MisToken.sol`. Deploy it.
    2.  Compile `MisClaim.sol`. Deploy it with Constructor Args: `(TokenAddress, YourBackendSignerAddress)`.
    3.  **Fund**: Transfer MisTokens to the `MisClaim` contract address so users can claim.

### TON (Testnet)
*   **Tool**: [TON Verifier](https://verfier.ton.org) or Blueprint.
*   **Manual**:
    1.  Use a standard Jetton Minter (e.g., from [Ton.org](https://ton.org)).
    2.  Mint tokens to your backend wallet or a specific distribution contract.

### XRPL (Testnet)
*   **Method**: Run Local Script.
*   Since XRPL doesn't host "contracts" in the EVM sense, you just need to configure the accounts on-ledger.
    ```bash
    cd contracts/xrp
    node issueToken.js
    ```
    *This will set up the TrustLines and issue tokens on the Testnet Ledger.*
