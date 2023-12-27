import * as dotenv from 'dotenv';

dotenv.config({
    path: `config/.env.${process.env.NODE_ENV}`,
});

import { AppModule } from './app.module';
import { NKConfig, router } from './core';
import { CustomLoggerService, NKLOGGER_NS, nkLogger } from './core/logger';
import { NestFactory } from '@nestjs/core';
import 'reflect-metadata';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { logger: new CustomLoggerService() });

    router(app);

    await app.listen(NKConfig.PORT, () => {
        nkLogger(NKLOGGER_NS.APP_INFO, `Current Mode: ${NKConfig.NODE_ENV}`);
        nkLogger(NKLOGGER_NS.APP_INFO, `Listening on port ${NKConfig.PORT}`);
        nkLogger(NKLOGGER_NS.APP_INFO, `Ready to service`);
    });
}

nkLogger(NKLOGGER_NS.APP_INFO, `---------------Configuration--------------------`);
Object.keys(NKConfig)
    .map((key) => `${key}: ${NKConfig[key]}`)
    .map((str) => nkLogger(NKLOGGER_NS.APP_INFO, str));

nkLogger(NKLOGGER_NS.APP_INFO, `-----------------------------------`);

bootstrap();
