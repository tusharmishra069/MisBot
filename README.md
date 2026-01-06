# Misbot - Web3 Tap-to-Earn Mini App

A production-grade Telegram Mini App featuring Multi-Chain support (Ethereum, XRP, TON) and robust off-chain architecture.

## 🏗 Architecture

The system uses a **Hybrid Architecture** to balance user experience (fast taps) with Web3 ownership (secure claims).

### Core Components
1.  **Frontend (Next.js)**: 
    - Telegram Mini App UI.
    - Connects to ETH, XRP, and TON wallets.
2.  **Backend (Node.js + Express)**: 
    - Validates Telegram Auth (`initData`).
    - Tracks Points & Energy in PostgreSQL.
    - Acting as the "Oracle" for Claim signatures.
3.  **Database (PostgreSQL)**: 
    - Persists User state and Transaction logs.
4.  **Blockchain (Testnets)**:
    - **Ethereum Sepolia**: ERC-20 Rewards.
    - **TON Testnet**: Jetton Rewards.
    - **XRP Testnet**: Token Drops.

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL
- Telegram Bot Token

### Installation

1.  **Clone & Install**
    ```bash
    git clone <repo>
    cd misbot
    npm install
    ```

2.  **Database Setup**
    ```bash
    # Run the init SQL script
    psql -U postgres -f database/init.sql
    ```

3.  **Backend Start**
    ```bash
    cd backend
    npm run dev
    ```

4.  **Frontend Start**
    ```bash
    cd frontend
    npm run dev
    ```
