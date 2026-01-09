// Simple Telegram Bot for MISBOT
// This sends a welcome message with interactive buttons

const TelegramBot = require('node-telegram-bot-api');
const http = require('http');
require('dotenv').config();

// Get bot token from environment
const BOT_TOKEN = process.env.BOT_TOKEN;

// Validate bot token
if (!BOT_TOKEN || BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
    console.error('❌ ERROR: BOT_TOKEN is not set in .env file!');
    console.error('Please add your bot token from @BotFather to the .env file');
    process.exit(1);
}

// Your web app URL (remove trailing slash if present)
const WEB_APP_URL = (process.env.WEB_APP_URL || 'https://mis-bot.vercel.app').replace(/\/$/, '');

// Create bot instance
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Create HTTP server for Render Web Service (free tier requirement)
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', bot: 'running' }));
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('MISBOT Telegram Bot is running');
    }
});

server.listen(PORT, () => {
    console.log(`✅ HTTP server listening on port ${PORT}`);
    console.log('✅ MISBOT Telegram Bot is running...');
});




// Welcome message text
const WELCOME_MESSAGE = `Welcome to MISBOT! ⚡💰

Experience the thrill of Web3 gaming. Tap to earn, upgrade your power, and compete on the leaderboard to earn exciting rewards. Start your mining journey now and be part of the next generation of gaming! 🚀`;

// Handle /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'there';

    // Inline keyboard with buttons (removed community button)
    const keyboard = {
        inline_keyboard: [
            [
                {
                    text: '🎮 Play Now',
                    web_app: { url: WEB_APP_URL }
                }
            ],
            [
                {
                    text: ' Invite Friends',
                    switch_inline_query: 'Join me on MISBOT! 🚀'
                }
            ]
        ]
    };

    // Send welcome message with buttons
    bot.sendMessage(chatId, WELCOME_MESSAGE, {
        reply_markup: keyboard,
        parse_mode: 'HTML'
    });
});

// Handle /help command
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpText = `
🎮 <b>MISBOT Commands</b>

/start - Launch the game
/play - Start mining
/help - Show this help message

<b>How to Play:</b>
1. Tap the "Play Now" button
2. Tap the screen to mine coins
3. Upgrade your power
4. Compete on the leaderboard!
    `;

    bot.sendMessage(chatId, helpText, { parse_mode: 'HTML' });
});

// Handle /play command
bot.onText(/\/play/, (msg) => {
    const chatId = msg.chat.id;

    const keyboard = {
        inline_keyboard: [
            [
                {
                    text: '🎮 Launch Game',
                    web_app: { url: WEB_APP_URL }
                }
            ]
        ]
    };

    bot.sendMessage(chatId, '🚀 Ready to start mining?', {
        reply_markup: keyboard
    });
});

console.log('✅ MISBOT is running...');
