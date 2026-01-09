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

### Option 2: Deploy to Cloud
Deploy to:
- **Render** (free tier available)
- **Railway** (free tier available)
- **Heroku**
- **DigitalOcean**

Set environment variables on your hosting platform.

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
