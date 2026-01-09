# MISBOT Telegram Bot

This bot sends welcome messages with interactive buttons when users start your bot.

## Setup

1. **Install dependencies:**
   ```bash
   cd telegram-bot
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add:
   - Your bot token from @BotFather
   - Your web app URL (https://mis-bot.vercel.app)

3. **Run the bot:**
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## Features

- ✅ Welcome message with inline buttons
- ✅ "Play Now" button (opens web app)
- ✅ "Join Community" button
- ✅ "Invite Friends" button
- ✅ /start, /help, /play commands

## Deployment

### Option 1: Run Locally
Just run `npm start` on your computer (bot must stay running)

### Option 2: Deploy to Render (Recommended)

**Deploy as Background Worker** (not Web Service):

1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Background Worker"**
3. Connect your GitHub repository
4. Configure:
   - **Name:** `misbot-telegram-bot`
   - **Root Directory:** `telegram-bot`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
5. Add environment variables:
   - `BOT_TOKEN` = Your bot token from @BotFather
   - `WEB_APP_URL` = Your frontend URL (e.g., https://mis-bot.vercel.app)
6. Click **"Create Background Worker"**
7. Wait for deployment to complete

**Why Background Worker?**
- Telegram bots with polling don't need to expose HTTP ports
- Background Workers are designed for long-running processes
- More efficient than Web Services for bots

### Option 3: Other Platforms
- **Railway** (free tier available)
- **Heroku** (paid)
- **DigitalOcean** (paid)
- **AWS EC2** (paid)

## Customization

Edit `bot.js` to:
- Change welcome message text
- Modify button labels
- Add more commands
- Customize button actions

## Testing

1. Open Telegram
2. Search for your bot (@YourBotUsername)
3. Send `/start`
4. You should see the welcome message with buttons!
