# Project Setup & Integration Guide

This document lists all the **secrets, keys, and configurations** you need to collect and where to put them to make **Misbot** work.

## 1. Environment Variables Checklist

### Backend (`/backend/.env`)
| Variable | Description | Where to get it? |
| :--- | :--- | :--- |
| `PORT` | Port for the server (default `3001`) | Set manually. |
| `DATABASE_URL` | Postgres Connection String | From your local Docker or Cloud Provider (Neon, Railway, AWS). |
| `BOT_TOKEN` | Telegram Bot Token | Talk to **[@BotFather](https://t.me/BotFather)** on Telegram -> `/newbot`. |
| `ETH_PRIVATE_KEY` | Ethereum Wallet Private Key | Export from MetaMask. Used for signing web3 claims. |
| `TON_MNEMONIC` | TON Wallet Mnemonic (24 words) | From TonKeeper. Used for wallet logic. |
| `XRP_SEED` | XRPL Account Seed (e.g., `sEd...`) | From XRPL Faucet or your wallet. |

### Frontend (`/frontend/.env` or `.env.local`)
| Variable | Description | Where to get it? |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | URL of your running Backend | `http://localhost:3001` (local) or `https://your-api.com` (prod). |
| `NEXT_PUBLIC_BOT_USERNAME` | Username of your Bot | From **[@BotFather](https://t.me/BotFather)** (without the `@`). |
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | WalletConnect ID | Register at [cloud.walletconnect.com](https://cloud.walletconnect.com). |

---

## 2. Integration Steps

### Step A: Telegram Bot Setup
1.  Go to **@BotFather**.
2.  Create a new bot: `/newbot`.
3.  Copy the **HTTP API Token** -> Paste into `backend/.env` as `BOT_TOKEN`.
4.  Type `/mybots` -> Select your bot -> **Bot Settings** -> **Menu Button**.
5.  Configure the Menu Button:
    *   **Url**: The URL where your Frontend is hosted (must be HTTPS).
        *   *Local Dev*: Use `ngrok http 3000` to get a public HTTPS URL.

### Step B: Database Integration
1.  **Local**: Run `docker run -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`.
2.  **Cloud**: Create a project on [Neon.tech](https://neon.tech) or [Railway.app](https://railway.app).
3.  Copy the connection string (e.g., `postgresql://user:pass@host:5432/db`).
4.  Paste into `backend/.env`.
5.  **Run Migration**:
    ```bash
    psql "YOUR_CONNECTION_STRING" -f database/init.sql
    ```

### Step C: Wallet & Chain Setup
1.  **Ethereum (Sepolia)**:
    *   Get a Private Key with Sepolia ETH (from a faucet).
    *   Paste into `backend/.env`.
    *   This key will be the "Signer" that authorizes user claims.
2.  **TON (Testnet)**:
    *   Create a v4 wallet in TonKeeper (switch to Testnet).
    *   Get some Testnet TON from [@testgiver_ton_bot](https://t.me/testgiver_ton_bot).
    *   Paste 24-word seed phrase into `backend/.env`.
3.  **XRP (Testnet)**:
    *   Go to [XRPL Faucet](https://xrpl.org/xrp-testnet-faucet.html).
    *   Generate credentials.
    *   Paste `s...` seed into `backend/.env`.

---

## 3. Quick Start (Local)

1.  **Start DB**: Ensure Postgres is running.
2.  **Start Backend**:
    ```bash
    cd backend
    npm install
    # Ensure .env is set
    npm run dev
    ```
3.  **Start Frontend**:
    ```bash
    cd frontend
    npm install
    # Ensure .env is set
    npm run dev
    ```
4.  **Tunnel (Important)**:
    Telegram Apps **require HTTPS**.
    ```bash
    ngrok http 3000
    ```
    Copy the `https://....ngrok-free.app` URL and give it to BotFather.
