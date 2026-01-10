# 🎮 MISBOT - Web3 Tap-to-Earn Telegram Mini App

<div align="center">

![MISBOT](https://img.shields.io/badge/MISBOT-Web3%20Gaming-orange?style=for-the-badge)
![TON](https://img.shields.io/badge/TON-Blockchain-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)

**A production-ready Telegram Mini App with tap-to-earn mechanics, TON wallet integration, and real-time leaderboards.**

[Live Demo](https://mis-bot.vercel.app) • [Report Bug](https://github.com/tusharmishra069/MisBot/issues) • [Request Feature](https://github.com/tusharmishra069/MisBot/issues)

</div>

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🎯 Core Gameplay
- **Tap-to-Earn Mechanics** - Earn coins by tapping with energy system
- **Upgrade System** - Boost tap power and passive income
- **Real-time Leaderboard** - Compete with other players globally
- **Anti-Cheat System** - Rate limiting (200 taps/10s) with cooldown penalties

### 💰 Web3 Integration
- **TON Wallet Connection** - Secure wallet linking via TonConnect
- **MISBOT Token System** - Exchange game coins for real MISBOT tokens (1000 coins = 1 MISBOT)
- **Token Claims** - Mint MISBOT tokens directly to your TON wallet
- **Balance Tracking** - Real-time MISBOT balance and claim history
- **Persistent Data** - All progress saved to PostgreSQL database

### 🔐 Security & Performance
- **Production-Ready** - CORS, rate limiting, input validation
- **Telegram Authentication** - Secure user verification via Telegram WebApp
- **Optimized Database** - Connection pooling, SSL support, indexed queries
- **Error Handling** - Comprehensive error handling with user feedback

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Next.js 16.1 (React 19)
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **State Management:** TanStack Query
- **Wallet Integration:** TonConnect UI React
- **Notifications:** Sonner (Toast)

### Backend
- **Runtime:** Node.js + Express
- **Database:** PostgreSQL with pg driver
- **Authentication:** Telegram WebApp initData validation
- **Security:** Helmet, CORS, express-rate-limit, express-validator
- **Blockchain:** TON SDK (@ton/ton, @ton/crypto)
- **Environment:** dotenv

### Telegram Bot
- **Library:** node-telegram-bot-api
- **Features:** Interactive inline keyboards, welcome messages

### DevOps
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Render
- **Database:** Render PostgreSQL / Neon / Supabase
- **Version Control:** Git + GitHub

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Telegram Mini App                        │
│                   (Next.js Frontend)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Tap Game    │  │  Leaderboard │  │ TON Wallet   │      │
│  │  Component   │  │  Component   │  │  Connect     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS API Calls
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Express Backend (Node.js)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Security Layer                                       │   │
│  │  • CORS Whitelist  • Rate Limiting  • Input Validation│  │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  /user       │  │  /tap        │  │ /connect-    │      │
│  │  endpoint    │  │  endpoint    │  │  wallet      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ /claim-      │  │ /misbot-     │  │ /misbot-     │      │
│  │  misbot      │  │  balance     │  │  history     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │ SQL Queries
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  users       │  │  wallets     │  │  tap_logs    │      │
│  │  table       │  │  table       │  │  table       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ misbot_      │  │   claims     │                         │
│  │  claims      │  │   table      │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Authentication:** Telegram WebApp → Backend validates `initData`
2. **Tap Action:** Frontend → Backend (rate limited) → Database
3. **Wallet Connection:** TonConnect → Frontend → Backend → Database
4. **Token Claims:** Frontend → Backend → TON Blockchain → Database
5. **Leaderboard:** Frontend → Backend (cached 5s) → Database

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** 14 or higher
- **Telegram Bot Token** (from [@BotFather](https://t.me/BotFather))
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/tusharmishra069/MisBot.git
   cd MisBot
   ```

2. **Set up the database**
   ```bash
   # Create database
   createdb misbot
   
   # Run schema
   psql -d misbot -f database/init.sql
   ```

3. **Configure Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Configure Frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

5. **Configure Telegram Bot**
   ```bash
   cd ../telegram-bot
   npm install
   cp .env.example .env
   # Edit .env with your bot token
   ```

### Running Locally

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# ✅ Backend running on port 3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# ▲ Next.js running on http://localhost:3000
```

**Terminal 3 - Telegram Bot:**
```bash
cd telegram-bot
npm start
# ✅ MISBOT Telegram Bot is running...
```

### Testing

1. Open your bot in Telegram
2. Send `/start`
3. Click "🎮 Play Now"
4. Start tapping and earning!

---

## 🌐 Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Set environment variables:
   - `NEXT_PUBLIC_BACKEND_URL`
   - `NEXT_PUBLIC_APP_URL`
4. Deploy!

### Backend (Render)

1. Create new Web Service in [Render](https://render.com)
2. Connect GitHub repository
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Add environment variables (see below)
5. Deploy!

### Telegram Bot (Render)

1. Create new Web Service in Render
2. Configure:
   - **Root Directory:** `telegram-bot`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Add environment variables:
   - `BOT_TOKEN`
   - `WEB_APP_URL`
4. Deploy!

### Database (Render PostgreSQL)

1. Create PostgreSQL instance in Render
2. Copy connection string
3. Add to backend environment variables

---

## 📁 Project Structure

```
MisBot/
├── backend/                 # Express API server
│   ├── src/
│   │   ├── index.ts        # Main server file
│   │   ├── db.ts           # Database configuration
│   │   ├── jetton-utils.ts # MISBOT token minting utilities
│   │   └── utils/          # Utility functions
│   ├── .env.example        # Environment template
│   └── package.json
│
├── frontend/               # Next.js web app
│   ├── app/
│   │   ├── page.tsx        # Main game page
│   │   ├── profile/        # Profile page
│   │   ├── layout.tsx      # Root layout
│   │   └── providers.tsx   # React providers
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks
│   ├── .env.example        # Environment template
│   └── package.json
│
├── telegram-bot/           # Telegram bot
│   ├── bot.js              # Bot logic
│   ├── .env.example        # Environment template
│   └── package.json
│
├── database/               # Database schemas
│   ├── init.sql            # Initial schema
│   └── migrations/         # Database migrations
│       └── 004_misbot_claims.sql  # MISBOT claims table
│
├── PRODUCTION_CHECKLIST.md # Deployment guide
└── README.md               # This file
```

---

## 🔐 Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Telegram
BOT_TOKEN=your_bot_token_from_botfather

# TON Blockchain (for MISBOT token minting)
TON_MINTER_ADDRESS=your_jetton_minter_address
TON_ADMIN_MNEMONIC="your 24 word mnemonic phrase"
TON_NETWORK=testnet  # or mainnet

# Server
PORT=3001
NODE_ENV=production

# Security
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://web.telegram.org
```

### Frontend (.env.local)

```bash
# Backend API
NEXT_PUBLIC_BACKEND_URL=https://your-backend.onrender.com

# App URL
NEXT_PUBLIC_APP_URL=https://your-frontend.vercel.app
```

### Telegram Bot (.env)

```bash
# Bot Configuration
BOT_TOKEN=your_bot_token_from_botfather
WEB_APP_URL=https://your-frontend.vercel.app
```

---

## 🔒 Security Features

### Backend Security
- ✅ **CORS Whitelist** - Only allowed origins can access API
- ✅ **Rate Limiting** - 100 req/15min general, 60 req/min for taps
- ✅ **Input Validation** - All inputs validated with express-validator
- ✅ **Helmet.js** - Security headers (XSS, clickjacking protection)
- ✅ **SQL Injection Prevention** - Parameterized queries
- ✅ **Error Handling** - No sensitive data leaks in production

### Frontend Security
- ✅ **Security Headers** - HSTS, CSP, X-Frame-Options
- ✅ **Hydration Mismatch Fix** - Telegram WebApp compatibility
- ✅ **Environment Variables** - Sensitive data in env vars only

### Anti-Cheat
- ✅ **Rate Limiting** - 200 taps per 10 seconds
- ✅ **Cooldown System** - 30-second penalty for violations
- ✅ **Server-side Validation** - All game logic on backend
- ✅ **Tap Logging** - Audit trail for suspicious activity

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Tushar Mishra**

- GitHub: [@tusharmishra069](https://github.com/tusharmishra069)

---

## 🙏 Acknowledgments

- [Telegram Mini Apps Documentation](https://core.telegram.org/bots/webapps)
- [TON Blockchain](https://ton.org)
- [Next.js](https://nextjs.org)
- [TonConnect](https://github.com/ton-connect)

---

<div align="center">

**⭐ Star this repo if you find it useful!**

Made with ❤️ by Tushar Mishra

</div>
