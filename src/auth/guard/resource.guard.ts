import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as _ from 'lodash';
import { NKKey } from '../../core/common/NKKey';
import { User } from '../../user/user.entity';

@Injectable()
export class ResourceGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const apiOptions = this.reflector.get<string>(NKKey.REFLECT_CONTROLLER, context.getClass());
        const user = request.user as User;
        const resource = _.get(apiOptions, 'resource', []);
        if (!resource.length) {
            return true;
        }

        if (user.role.source.includes('*')) {
            return true;
        }

        if (resource.includes(user.role.source)) {
            return true;
        }

        return false;
    }
}
