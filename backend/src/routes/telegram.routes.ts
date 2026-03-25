import { Router, Request, Response } from 'express';
import { processTelegramUpdate } from '../utils/telegram';
import { logger } from '../utils/logger';

const router = Router();

// POST /api/telegram/webhook - Telegram bot webhook
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    await processTelegramUpdate(req.body);
  } catch (err) {
    logger.error('Telegram webhook error:', err);
  }
  res.json({ ok: true }); // Always return 200 to Telegram
});

// GET /api/telegram/test-send - Debug endpoint
router.get('/test-send', async (req: Request, res: Response) => {
  const { phone, otp } = req.query;
  if (!phone || !otp) {
    res.json({ error: 'Need ?phone=...&otp=...' });
    return;
  }
  const { sendOtpViaTelegram, getChatId } = await import('../utils/telegram');
  const chatId = getChatId(phone as string);
  const sent = await sendOtpViaTelegram(phone as string, otp as string);
  res.json({ sent, chatId: chatId || null, phone });
});

export default router;
