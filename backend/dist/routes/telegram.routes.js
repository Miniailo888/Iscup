"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const telegram_1 = require("../utils/telegram");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();

// POST /api/telegram/webhook - Telegram bot webhook
router.post('/webhook', (req, res) => {
    try {
        logger_1.logger.info('Telegram webhook received: ' + JSON.stringify(req.body).substring(0, 200));
        (0, telegram_1.processTelegramUpdate)(req.body);
        res.json({ ok: true });
    }
    catch (err) {
        logger_1.logger.error('Telegram webhook error:', err);
        res.json({ ok: true });
    }
});

// POST /api/telegram/send-code - Direct send code to chat_id
router.post('/send-code', async (req, res) => {
    try {
        const { phone, chatId } = req.body;
        if (phone && chatId) {
            (0, telegram_1.saveChatId)(phone, chatId);
        }
        const session = (0, telegram_1.getSessionByPhone)(phone);
        if (session) {
            const sent = await (0, telegram_1.sendOtpDirect)(chatId, session.otp);
            res.json({ ok: sent });
        } else {
            res.json({ ok: false, error: 'No active session' });
        }
    }
    catch (err) {
        logger_1.logger.error('Send code error:', err);
        res.status(500).json({ ok: false });
    }
});

exports.default = router;
