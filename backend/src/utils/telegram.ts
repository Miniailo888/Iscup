import { logger } from './logger';
import { prisma } from './prisma';

const BOT_TOKEN = "8778237684:AAG81-EM0ZMbdFUd6x6id1xpSvAVN_WagNo";
const SERVER_URL = process.env.SERVER_URL || "https://iscup-production-25c2.up.railway.app";

// In-memory chatId store (persists during server lifetime)
const phoneChats = new Map<string, number>();

// Auth sessions — store in memory + DB fallback
const authSessions = new Map<string, { phone: string; otp: string; createdAt: number; sent?: boolean }>();

export function createAuthSession(phone: string, otp: string): string {
  const token = Math.random().toString(36).substring(2, 10).toUpperCase();
  authSessions.set(token, { phone, otp, createdAt: Date.now() });
  // Also store in DB for persistence across restarts
  prisma.phoneVerification.updateMany({
    where: { phone, otpHash: require('crypto').createHash('sha256').update(otp).digest('hex'), isUsed: false },
    data: { ipAddress: `tg:${token}` }, // Store token in ipAddress field
  }).catch(() => {});
  logger.info(`Auth session: ${token} for ***${phone.slice(-4)}`);
  return token;
}

export function getAuthSession(token: string) {
  return authSessions.get(token) || null;
}

// Try to find session in DB if not in memory (after server restart)
async function findSessionInDB(token: string): Promise<{ phone: string; otp: string } | null> {
  try {
    const record = await prisma.phoneVerification.findFirst({
      where: { ipAddress: `tg:${token}`, isUsed: false, expiresAt: { gte: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (record) {
      return { phone: record.phone, otp: '' }; // We don't need OTP here, just phone→chatId mapping
    }
  } catch {}
  return null;
}

export function saveChatId(phone: string, chatId: number) {
  phoneChats.set(phone.replace(/\D/g, ''), chatId);
  logger.info(`Saved chat_id ${chatId} for phone ***${phone.slice(-4)}`);
}

export function getChatId(phone: string): number | undefined {
  return phoneChats.get(phone.replace(/\D/g, ''));
}

export async function sendOtpViaTelegram(phone: string, otp: string): Promise<boolean> {
  const chatId = getChatId(phone);
  if (!chatId) {
    logger.warn(`No Telegram chat_id for phone ***${phone.slice(-4)}`);
    return false;
  }

  try {
    const message = `🔐 Ваш код Spil: *${otp}*\n\nДійсний 5 хвилин.`;
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }),
    });

    if (!res.ok) {
      logger.error('Telegram send error:', await res.json());
      return false;
    }

    logger.info(`OTP sent via Telegram to chat_id ${chatId}`);
    return true;
  } catch (err) {
    logger.error('Telegram send error:', err);
    return false;
  }
}

export async function processTelegramUpdate(update: any) {
  const message = update.message;
  if (!message?.text) return;

  const chatId = message.chat.id;
  const text = message.text.trim();

  if (text.startsWith('/start')) {
    const parts = text.split(' ');
    const token = parts[1];

    if (token) {
      // Check memory first, then DB
      let session = authSessions.get(token);
      if (!session) {
        const dbSession = await findSessionInDB(token);
        if (dbSession) session = { ...dbSession, createdAt: Date.now() };
      }

      if (session) {
        saveChatId(session.phone, chatId);

        // Find the latest OTP for this phone
        const latestOtp = await prisma.phoneVerification.findFirst({
          where: { phone: session.phone, isUsed: false, expiresAt: { gte: new Date() } },
          orderBy: { createdAt: 'desc' },
        }).catch(() => null);

        if (latestOtp) {
          // We need the actual OTP — get it from memory session or generate message without it
          const otpCode = session.otp || '(введіть код з додатку)';
          await sendTelegramMessage(chatId, `🔐 Ваш код Spil: *${otpCode}*\n\nВведіть цей код в додатку.`);
          if (session.otp) session.sent = true;
          logger.info(`Code sent to ${chatId} via token ${token}`);
        } else {
          await sendTelegramMessage(chatId, `⏰ Код прострочений. Спробуйте ще раз в додатку.`);
        }
      } else {
        await sendTelegramMessage(chatId, `⏰ Сесія не знайдена. Спробуйте ще раз в додатку.`);
      }
    } else {
      await sendTelegramMessage(chatId, `👋 Привіт! Це бот Spil.\n\n📲 Відкрийте додаток Spil щоб увійти.`);
    }
    return;
  }

  const phoneMatch = text.match(/^\+?\d{10,13}$/);
  if (phoneMatch) {
    saveChatId(text, chatId);
    await sendTelegramMessage(chatId, `✅ Номер ${text} прив'язано!`);
    return;
  }
}

async function sendTelegramMessage(chatId: number, text: string) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
    });
    if (!res.ok) logger.error('TG send fail:', await res.text());
  } catch (err) {
    logger.error('Telegram message error:', err);
  }
}

export async function setupTelegramWebhook(serverUrl?: string) {
  const url = serverUrl || SERVER_URL;
  const webhookUrl = `${url}/api/telegram/webhook`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl }),
    });
    const data = await res.json();
    logger.info('Telegram webhook:', data);
  } catch (err) {
    logger.error('Webhook setup error:', err);
  }
}
