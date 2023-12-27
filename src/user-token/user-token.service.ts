import { InjectEntityManager } from '@nestjs/typeorm';
import jwt from 'jsonwebtoken';
import { NKConfig } from '../core';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { NKService } from '../core/decorators/NKService.decorator';
import { SingleService } from '../single/single.service';
import { User } from '../user/user.entity';
import { EntityManager, LessThan } from 'typeorm';
import { UserToken, UserTokenType } from './user-token.entity';

@NKService()
export class UserTokenService extends NKServiceBase<UserToken> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
        private readonly singleService: SingleService,
    ) {
        super(entityManager.getRepository(UserToken));

        this.apiOptions = {
            isAllowDelete: false,
            query: {
                relations: ['user'],
            },
        };
    }
    private async createToken(
        user: User,
        value: string,
        type: UserTokenType,
        maxAge: number,
        isOnlyOne: boolean,
        entityManager: EntityManager,
    ) {
        if (isOnlyOne) {
            await entityManager.update(
                UserToken,
                {
                    user: {
                        id: user.id,
                    },
                    type: type,
                },
                {
                    isDeleted: true,
                },
            );
        }

        const token = new UserToken();
        token.user = user;
        token.type = type;
        token.expiredAt = new Date(Date.now() + maxAge);
        token.token = jwt.sign(
            { id: user.id, type: type, expiredAt: token.expiredAt.getTime() },
            NKConfig.JWT_SECRET_KEY,
        );
        if (value) {
            token.value = value;
        } else {
            token.value = token.token;
        }

        return await entityManager.save(token);
    }

    async clearExpiredToken() {
        const currentDate = new Date();
        await this.entityManager.update(
            UserToken,
            {
                expiredAt: LessThan(currentDate),
            },
            {
                isDeleted: true,
            },
        );
        // Delete all expired token after 1 week
        const expiredDate = new Date(currentDate.getTime() - 1000 * 60 * 60 * 24 * 7);
        await this.entityManager.delete(UserToken, {
            expiredAt: LessThan(expiredDate),
        });
    }

    async createAuth(user: User, entityManager: EntityManager) {
        const tokenAuthMaxAge = await this.singleService.getSingle(
            UserToken.name,
            'USER_TOKEN_AUTH_MAX_AGE',
            1000 * 60 * 15 * 1000 + '',
        );

        const isOnlyOne =
            (await this.singleService.getSingle(UserToken.name, 'USER_TOKEN_AUTH_IS_ONLY_ONE', '1')).value === '1';

        return await this.createToken(
            user,
            '',
            UserTokenType.AUTH,
            Number(tokenAuthMaxAge.value),
            isOnlyOne,
            entityManager,
        );
    }

    async destroyAuth(user: User) {
        await this.entityManager.update(
            UserToken,
            {
                user: {
                    id: user.id,
                },
            },
            {
                isDeleted: true,
            },
        );
    }

    private generateOTP(length: number) {
        let otp = '';
        for (let i = 0; i < length; i++) {
            otp += Math.floor(Math.random() * 10);
        }

        return otp;
    }

    async createResetPassword(user: User, entityManager: EntityManager) {
        const tokenResetPasswordMaxAge = await this.singleService.getSingle(
            UserToken.name,
            'USER_TOKEN_RESET_PASSWORD_MAX_AGE',
            1000 * 60 * 5 + '',
        );

        const newOtp = this.generateOTP(8);

        return await this.createToken(
            user,
            newOtp,
            UserTokenType.RESET_PASSWORD,
            Number(tokenResetPasswordMaxAge.value),
            true,
            entityManager,
        );
    }

    async validateToken(token: string, user: User): Promise<UserToken> {
        try {
            const payload = jwt.verify(token, NKConfig.JWT_SECRET_KEY) as any;
            const userToken = await this.getOneByField('token', token);
            if (!userToken) {
                return null;
            }
            if (userToken.expiredAt.getTime() < Date.now()) {
                return null;
            }
            if (userToken.user.id !== user.id) {
                return null;
            }

            return payload;
        } catch (err) {
            return null;
        }
    }

    async validateAnonymousOtp(otp: string): Promise<UserToken> {
        try {
            const userToken = await this.getOneByField('value', otp);
            if (!userToken) {
                return null;
            }
            if (userToken.expiredAt.getTime() < Date.now()) {
                return null;
            }

            return userToken;
        } catch (err) {
            return null;
        }
    }

    async validateAnonymousToken(token: string, isComplete: boolean): Promise<UserToken> {
        try {
            const payload = jwt.verify(token, NKConfig.JWT_SECRET_KEY) as any;
            const userToken = await this.getOneByField('token', token);

            if (!userToken) {
                return null;
            }
            if (userToken.expiredAt.getTime() < Date.now()) {
                return null;
            }

            if (isComplete) {
                await this.entityManager.update(UserToken, { id: userToken.id }, { isDeleted: true });
            }

            return userToken;
        } catch (err) {
            return null;
        }
    }
}
