import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';

import { Request } from 'express';
import * as _ from 'lodash';
import { NKGlobal } from '../../core/common/NKGlobal';
import { NKResponseException, nkMessage } from '../../core/exception';
import { decodeToken, decodedRawToken } from '../../core/util/encrypt.helper';
import { UserToken, UserTokenType } from '../../user-token/user-token.entity';
import { User } from '../../user/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor() {}
    async extendAuthOnActivity(user: User, time: number) {
        // let tokens = await NKGlobal.entityManager.find(UserToken, {
        //     where: {
        //         user: {
        //             id: user.id,
        //             isDeleted: false,
        //         },
        //         type: UserTokenType.AUTH,
        //     },
        // });
        // tokens = tokens.map((token) => {
        //     // token less than 5 minutes
        //     if (token.expiredAt.getTime() - Date.now() < 1000 * 60 * 500) {
        //         token.expiredAt = new Date(Date.now() + time);
        //     }
        //     return token;
        // });
        // await NKGlobal.entityManager.save(tokens);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        // check exclude url
        let isEnumOption = request.url.includes('enum-options');
        if (isEnumOption) {
            return true;
        }

        const token = _.get(request, 'headers.authorization', '').replace('Bearer ', '').trim();
        if (!token) {
            throw new NKResponseException(nkMessage.error.unauthorized, HttpStatus.UNAUTHORIZED);
        }

        // const userToken = await NKGlobal.entityManager.findOne(UserToken, {
        //     where: {
        //         token,
        //         isDeleted: false,
        //         type: UserTokenType.AUTH,
        //     },
        //     relations: ['user'],
        // });

        // if (!userToken) {
        //     throw new NKResponseException(nkMessage.error.unauthorized, HttpStatus.UNAUTHORIZED);
        // }

        // // if (userToken.expiredAt < new Date()) {
        // //     throw new NKResponseException(nkMessage.error.unauthorized, HttpStatus.UNAUTHORIZED);
        // // }

        const decodedToken = await decodedRawToken<{ id: string }>(token);
        if (!decodedToken) {
            throw new NKResponseException(nkMessage.error.unauthorized, HttpStatus.UNAUTHORIZED);
        }

        const user = await NKGlobal.entityManager.findOne(
            User,
            { id: decodedToken.id },
            {
                relations: ['role'],
            },
        );

        if (!user || user.isDeleted) {
            throw new NKResponseException(nkMessage.error.unauthorized, HttpStatus.UNAUTHORIZED);
        }

        request.user = user;
        // add 15 minutes to token
        // this.extendAuthOnActivity(user, 1000 * 60 * 15);
        return true;
    }
}
