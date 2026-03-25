export declare function createAuthSession(phone: string, otp: string): string;
export declare function getAuthSession(token: string): {
    phone: string;
    otp: string;
    createdAt: number;
    sent?: boolean;
} | null;
export declare function saveChatId(phone: string, chatId: number): void;
export declare function getChatId(phone: string): number | undefined;
export declare function sendOtpViaTelegram(phone: string, otp: string): Promise<boolean>;
export declare function processTelegramUpdate(update: any): Promise<void>;
export declare function setupTelegramWebhook(serverUrl?: string): Promise<void>;
//# sourceMappingURL=telegram.d.ts.map