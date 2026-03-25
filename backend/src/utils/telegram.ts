import { logger } from './logger';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

interface TelegramChat {
  phone: string;
  chatId: number;
}

// In-memory store for phone -> chatId mapping
// In production, use the database
const phoneChats = new Map<string, number>();

export function saveChatId(phone: string, chatId: number) {
  phoneChats.set(phone.replace(/\D/g, ''), chatId);
  logger.info(`Saved chat_id ${chatId} for phone ***${phone.slice(-4)}`);
}

export function getChatId(phone: string): number | undefined {
  return phoneChats.get(phone.replace(/\D/g, ''));
}

export async function sendOtpViaTelegram(phone: string, otp: string): Promise<boolean> {
  if (!BOT_TOKEN) {
    logger.warn('TELEGRAM_BOT_TOKEN not set, skipping Telegram OTP');
    return false;
  }

  const chatId = getChatId(phone);
  if (!chatId) {
    logger.warn(`No Telegram chat_id for phone ***${phone.slice(-4)}`);
    return false;
  }

  try {
    const message = `🔐 Ваш код підтвердження Spil: *${otp}*\n\nДійсний 5 хвилин. Не повідомляйте нікому.`;

    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      logger.error('Telegram send error:', err);
      return false;
    }

    logger.info(`OTP sent via Telegram to chat_id ${chatId}`);
    return true;
  } catch (err) {
    logger.error('Telegram send error:', err);
    return false;
  }
}

// Process incoming Telegram updates (webhook)
export function processTelegramUpdate(update: any) {
  const message = update.message;
  if (!message?.text) return;

  const chatId = message.chat.id;
  const text = message.text.trim();

  if (text.startsWith('/start')) {
    const parts = text.split(' ');
    const phone = parts[1]; // /start +380XXXXXXXXX

    if (phone) {
      saveChatId(phone, chatId);
      sendTelegramMessage(chatId,
        `✅ Telegram підключено!\n\n📱 Телефон: ${phone}\n\nТепер ви будете отримувати коди підтвердження в цей чат.\n\nПоверніться до додатку Spil і продовжте реєстрацію.`
      );
    } else {
      sendTelegramMessage(chatId,
        `👋 Привіт! Це бот Spil.\n\n📲 Щоб підключити Telegram, відкрийте додаток Spil і натисніть "Увійти через Telegram".\n\nБот автоматично надішле вам код підтвердження.`
      );
    }
    return;
  }

  // If user sends a phone number directly
  const phoneMatch = text.match(/^\+?\d{10,13}$/);
  if (phoneMatch) {
    saveChatId(text, chatId);
    sendTelegramMessage(chatId, `✅ Номер ${text} прив'язано! Тепер OTP коди будуть приходити сюди.`);
    return;
  }
}

async function sendTelegramMessage(chatId: number, text: string) {
  if (!BOT_TOKEN) return;

  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch (err) {
    logger.error('Telegram message error:', err);
  }
}

// Setup webhook for Telegram
export async function setupTelegramWebhook(serverUrl: string) {
  if (!BOT_TOKEN) {
    logger.warn('TELEGRAM_BOT_TOKEN not set, skipping webhook setup');
    return;
  }

  const webhookUrl = `${serverUrl}/api/telegram/webhook`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl }),
    });

    const data = await res.json();
    logger.info('Telegram webhook setup:', data);
  } catch (err) {
    logger.error('Telegram webhook setup error:', err);
  }
}
