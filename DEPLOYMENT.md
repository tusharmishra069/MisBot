# Production Deployment Guide

Your MisBot is code-complete and production-ready. 
Follow these steps to deploy to the live internet.

## 1. Backend Deployment (Render / Railway / Heroku)

Deploy the `backend` folder.

**Required Environment Variables:**
| Variable | Value | Description |
|----------|-------|-------------|
| `PORT` | `3001` | Port to listen on (Render sets this automatically) |
| `DATABASE_URL` | `postgresql://...` | Your NeonDB Connection String |
| `BOT_TOKEN` | `...` | Your Telegram Bot Token (from BotFather) |
| `NODE_ENV` | `production` | **CRITICAL**: Disables the insecure Dev Bypass |

---

## 2. Frontend Deployment (Vercel)

Deploy the `frontend` folder.

**Required Environment Variables:**
| Variable | Value | Update Instructions |
|----------|-------|---------------------|
| `NEXT_PUBLIC_BACKEND_URL` | `https://your-backend.onrender.com` | URL of your deployed Backend |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | URL of your deployed Frontend |

### ⚠️ Important Note
You **DO NOT** need to set `NEXT_PUBLIC_TON_MANIFEST_URL`. 
The app now automatically generates it at `${NEXT_PUBLIC_APP_URL}/api/manifest`.

---

## 3. Telegram Bot Setup (BotFather)

1. Go to [@BotFather](https://t.me/BotFather)
2. Select your bot
3. Go to **Bot Settings** > **Menu Button** > **Configure Menu Button**
4. Send the URL of your Vercel App (e.g., `https://mis-bot.vercel.app`)
