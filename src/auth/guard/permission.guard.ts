import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { Request } from 'express';
import * as _ from 'lodash';
import { NKResponseException, nkMessage } from '../../core/exception';
import { NKKey } from '../../core/common/NKKey';
import { User } from '../../user/user.entity';

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        let isEnumOption = request.url.includes('enum-options');
        if (isEnumOption) {
            return true;
        }

        const apiOptions = this.reflector.get<string>(NKKey.REFLECT_CONTROLLER, context.getClass());
        let permission = _.get(apiOptions, 'permission', 0);

        const isSelectOption = request.url.includes('select-options');

        if (isSelectOption) {
            const selectOptionPermission = _.get(apiOptions, 'selectOptionPermission', 0);
            if (selectOptionPermission) {
                permission = selectOptionPermission;
            }
        }

        const currentUser = request.user as User;
        if (!permission) {
            return true;
        }

        if (currentUser.role.index < permission) {
            throw new NKResponseException(nkMessage.error.permissionDenied, HttpStatus.FORBIDDEN);
        }

        return true;
    }
}
