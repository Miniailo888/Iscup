import { Router, Request, Response } from 'express';
import { processTelegramUpdate } from '../utils/telegram';
import { logger } from '../utils/logger';

const router = Router();

// POST /api/telegram/webhook - Telegram bot webhook
router.post('/webhook', (req: Request, res: Response) => {
  try {
    processTelegramUpdate(req.body);
    res.json({ ok: true });
  } catch (err) {
    logger.error('Telegram webhook error:', err);
    res.json({ ok: true }); // Always return 200 to Telegram
  }
});

export default router;
