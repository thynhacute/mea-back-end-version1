import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NKConfig } from '../NKConfig';
import { CRON_NAME } from './cron.constant';
import { CronService } from './cron.service';
import { UserTokenCronProcessor } from './consumer/userToken.cron';
import { UserTokenModule } from '../../user-token/user-token.module';

@Module({
    imports: [
        UserTokenModule,
        BullModule.registerQueueAsync(
            ...Object.keys(CRON_NAME).map((key) => {
                return {
                    name: key,
                    redis: {
                        port: NKConfig.CRON_REDIS_PORT,
                        host: NKConfig.CRON_REDIS_HOST,
                    },
                };
            }),
        ),
    ],
    controllers: [],
    providers: [UserTokenCronProcessor, CronService],
    exports: [CronService],
})
export class CronModule implements NestModule {
    constructor(private monitor: CronService) {}
    async configure(consumer: MiddlewareConsumer) {
        await this.monitor.init();
        consumer.apply(this.monitor.router).forRoutes('/api/monitor/cron');
    }
}
