import { User } from '../../../../user/user.entity';
import { NKConfig } from '../../../NKConfig';

import { fakeData, fakeUser } from '../../../../core/test/helper';
//---- Helper
import { initTestModule } from '../../../test/initTest';
//---- Entity
//---- Service
import { RedisService } from '../redis.service';
import { INestApplication } from '@nestjs/common';
import { createClient } from 'redis';

describe('RedisService', () => {
    let app: INestApplication;
    let redisService: RedisService;
    let redis: any;

    beforeAll(async () => {
        const { getApp } = await initTestModule();
        app = getApp;

        redis = createClient({ url: NKConfig.REDIS_URL });
        await redis.connect();

        redisService = new RedisService(redis);
    });

    describe('setObjectByKey', () => {
        let user: User;

        beforeEach(() => {
            user = fakeUser();
        });

        it('Pass', async () => {
            await redisService.setObjectByKey('user', user);
            const res = await redisService.getObjectByKey<User>('user');
            expect(res).toBeDefined();
        });

        it('Pass with time', async () => {
            await redisService.setObjectByKey('user', user, 10);
            const res = await redisService.getObjectByKey<User>('user');
            expect(res).toBeDefined();
        });
    });

    describe('deleteByKey', () => {
        let user: User;

        beforeEach(async () => {
            user = fakeUser();
            await redisService.setObjectByKey('user', user);
        });

        it('Pass', async () => {
            await redisService.deleteByKey('user');
            const res = await redisService.getObjectByKey<User>('user');
            expect(res).toBeNull();
        });
    });

    describe('getObjectByKey', () => {
        let user: User;

        beforeEach(async () => {
            user = fakeUser();
            await redisService.setObjectByKey('user', user);
        });

        it('Pass', async () => {
            const res = await redisService.getObjectByKey<User>('user');
            expect(res).toBeDefined();
        });
    });

    describe('setByValue', () => {
        let value: number;
        let key: string;

        beforeEach(() => {
            value = parseInt(fakeData(5, 'number'));
            key = fakeData(8, 'lettersAndNumbers');
        });

        it('Pass (do not have expired)', async () => {
            await redisService.setByValue(key, value);
            const res = await redisService.getByKey(key);
            expect(res).toBeDefined();
        });

        it('Pass (expired = 0.01 minutes)', async () => {
            await redisService.setByValue(key, value, 60);
            const output = await redisService.getByKey(key);
            expect(output).toBeDefined();
        });
    });

    describe('getByKey', () => {
        let value: number;
        let key: string;

        beforeEach(async () => {
            value = parseInt(fakeData(5, 'number'));
            key = fakeData(8, 'lettersAndNumbers');
            await redisService.setByValue(key, value);
        });

        it('Pass', async () => {
            const res = await redisService.getByKey(key);
            expect(res).toBeDefined();
        });
    });

    afterAll(async () => {
        await redis.quit();
        await app.close();
    });
});
