import { Controller } from '@nestjs/common';
import { UserRoleService } from './user-role.service';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { UserRole } from './user-role.entity';
import { NKCurdControllerBase } from '../core/common/NKCurdControllerBase';
import { NKKey } from '../core/common/NKKey';
import { Reflector } from '@nestjs/core';
import { RouterBaseMethodEnum } from '../core/enum/RouterBaseMethodEnum';
import { UserRoleIndex } from './user-role.constant';

@NKAuthController({
    model: {
        type: UserRole,
    },
    isAllowDelete: false,
    baseMethods: [
        RouterBaseMethodEnum.GET_ALL,
        RouterBaseMethodEnum.GET_SELECT_OPTION,
        RouterBaseMethodEnum.GET_PAGING,
    ],
    selectOptionField: 'name',
    permission: UserRoleIndex.USER,
})
export class UserRoleController extends NKCurdControllerBase<UserRole> {
    constructor(private readonly userRoleService: UserRoleService) {
        const reflector = new Reflector();
        userRoleService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, UserRoleController);
        super(userRoleService);
    }
}
