import { Module } from '@nestjs/common';
import { createClient } from 'redis';
import { NKConfig } from '../../NKConfig';
import * as Redis from 'redis';
//---- Utils

//---- Service
import { RedisService } from './redis.service';

@Module({
    imports: [],
    controllers: [],
    providers: [
        RedisService,
        {
            provide: 'RedisClient',
            useFactory: async () => {
                const redis = Redis.createClient({
                    url: NKConfig.REDIS_URL,
                });
                await redis.connect();
                return redis;
            },
        },
    ],
    exports: [RedisService],
})
export class RedisModule {}
