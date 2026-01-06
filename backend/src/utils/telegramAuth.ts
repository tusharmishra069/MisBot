import crypto from 'crypto';

export function verifyTelegramWebAppData(telegramInitData: string): boolean {
    const urlParams = new URLSearchParams(telegramInitData);
    const hash = urlParams.get('hash');

    if (!hash) return false;

    urlParams.delete('hash');

    const params: string[] = [];
    for (const [key, value] of urlParams.entries()) {
        params.push(`${key}=${value}`);
    }

    // Telegram requires parameters to be sorted alphabetically
    params.sort();

    const dataCheckString = params.join('\n');

    const botToken = process.env.BOT_TOKEN;
    if (!botToken) throw new Error('BOT_TOKEN is not defined');

    // HMAC-SHA256 signature calculation
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    return calculatedHash === hash;
}

export function parseUserData(telegramInitData: string) {
    const urlParams = new URLSearchParams(telegramInitData);
    const userStr = urlParams.get('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
}
