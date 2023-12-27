import { Injectable, Inject } from '@nestjs/common';
import flat from 'flat';
import * as Redis from 'redis';
//----- Service

@Injectable()
export class RedisService {
    constructor(@Inject('RedisClient') private readonly redisRepository: Redis.RedisClientType<any>) {}

    /**
     *
     * @param expired amount time for redis value to be expired( 1 = 60s )
     */
    async setObjectByKey(key: string, value: Record<string, any>, expired?: number) {
        const flatValue: Record<string, any> = flat(value);
        const convertToString = JSON.stringify(flatValue);

        try {
            const result = await this.redisRepository.set(key, convertToString);
            if (expired) this.redisRepository.expire(key, expired * 60);
            return result;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async deleteByKey(key: string) {
        try {
            const result = await this.redisRepository.del(key);
            return result;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async getObjectByKey<T>(key: string) {
        try {
            const result = await this.redisRepository.get(key);
            if (!result) return null;
            const convertToObject = JSON.parse(result);
            const unflatValue = flat.unflatten(convertToObject);
            return unflatValue as T;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    /**
     *
     * @param expired amount time for redis value to be expired( 1 = 60s )
     */
    async setByValue(key: string, value: number | string, expired?: number) {
        try {
            const result = await this.redisRepository.set(key, value);
            if (expired) this.redisRepository.expire(key, expired * 60);
            return result;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async getByKey(key: string): Promise<string> {
        try {
            const result = await this.redisRepository.get(key);
            return result;
        } catch (error) {
            console.log(error);
            return null;
        }
    }

    async getAllKeyWithPattern(pattern: string): Promise<string[]> {
        try {
            const result = await this.redisRepository.keys(pattern);
            return result;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}
