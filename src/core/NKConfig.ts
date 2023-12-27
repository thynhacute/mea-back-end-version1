/* eslint-disable prettier/prettier */

export const NKConfig = {
    // Database config
    DB_HOST: process.env.DB_HOST || '',
    DB_USERNAME: process.env.DB_USERNAME || '',
    DB_PASSWORD: process.env.DB_PASSWORD || '',
    DB_NAME: process.env.DB_NAME || '',
    DB_PORT: Number(process.env.DB_PORT) || 5432,

    // Sender config
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
    TELEGRAM_BOT_CHAT_ID: process.env.TELEGRAM_BOT_CHAT_ID || '',

    // Redis config
    REDIS_URL: process.env.REDIS_URL || '',

    // Queue config
    QUEUE_REDIS_HOST: process.env.QUEUE_REDIS_HOST || '',
    QUEUE_REDIS_PORT: Number(process.env.QUEUE_REDIS_PORT) || 6379,

    // CRON config
    CRON_REDIS_HOST: process.env.CRON_REDIS_HOST || '',
    CRON_REDIS_PORT: Number(process.env.CRON_REDIS_PORT) || 6379,

    // Google OAuth config
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
    GOOGLE_SECRET: process.env.GOOGLE_SECRET || '',
    GOOGLE_CLIENT_REDIRECT_URL: process.env.GOOGLE_CLIENT_REDIRECT_URL || '',

    // MOMO payment config
    MOMO_PAYMENT_ENDPOINT: process.env.MOMO_PAYMENT_ENDPOINT || '',
    MOMO_CALLBACK_ENDPOINT: process.env.MOMO_CALLBACK_ENDPOINT || '',
    MOMO_PARTNER_CODE: process.env.MOMO_PARTNER_CODE || '',
    MOMO_ACCESS_KEY: process.env.MOMO_ACCESS_KEY || '',
    MOMO_SECRET_KEY: process.env.MOMO_SECRET_KEY || '',
    MOMO_SIGNATURE_PRIVATE_KEY: process.env.MOMO_SIGNATURE_PRIVATE_KEY || '',
    MOMO_SIGNATURE_PUBLIC_KEY: process.env.MOMO_SIGNATURE_PUBLIC_KEY || '',

    // AWS S3 config
    AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY || '',
    AWS_SECRET_KEY: process.env.AWS_SECRET_KEY || '',
    AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME || '',
    AWS_PREFIX: process.env.AWS_PREFIX || '',

    // Firebase config
    FIREBASE_SERVER_KEY: process.env.FIREBASE_SERVER_KEY || '',

    // Sendgrid config
    SENDGRID_KEY: process.env.SENDGRID_KEY || '',
    SENDGRID_SENDER: process.env.SENDGRID_SENDER || '',

    // Common config
    PORT: Number(process.env.PORT) || 4000,
    NODE_ENV: process.env.NODE_ENV || '',
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || '',
    DEBUG: process.env.DEBUG || '',
    CLIENT_URL: (process.env.CLIENT_URL || '').split(','),
    SERVER_URL: process.env.SERVER_URL || '',
};
