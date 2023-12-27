import { BullModule } from '@nestjs/bull';
import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { NKConfig } from '../NKConfig';
import { QUEUE_NAME } from './queue.constant';
import { QueueService } from './queue.service';
import { SendQueueProcessor } from './consumer/send.queue';
import { SenderModule } from '../../sender/sender.module';

@Global()
@Module({
    imports: [
        SenderModule,
        BullModule.forRoot({
            redis: { host: NKConfig.CRON_REDIS_HOST, port: +NKConfig.QUEUE_REDIS_HOST },
        }),

        BullModule.registerQueueAsync(
            ...Object.keys(QUEUE_NAME).map((key) => {
                return {
                    name: key,
                    useFactory: () => ({
                        redis: {
                            port: NKConfig.QUEUE_REDIS_PORT,
                            host: NKConfig.QUEUE_REDIS_HOST,
                        },
                    }),
                };
            }),
        ),
    ],
    controllers: [],
    providers: [QueueService, SendQueueProcessor],
    exports: [QueueService, BullModule],
})
export class QueueModule implements NestModule {
    constructor(private monitor: QueueService) {}
    async configure(consumer: MiddlewareConsumer) {
        await this.monitor.init();
        consumer.apply(this.monitor.router).forRoutes('/api/monitor/queue');
    }
}
