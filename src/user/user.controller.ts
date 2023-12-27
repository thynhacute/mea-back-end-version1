import { Get } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { kebabCase } from 'lodash';
import { NKCurdControllerBase } from '../core/common/NKCurdControllerBase';
import { NKKey } from '../core/common/NKKey';
import { EnumListItem } from '../core/common/dtos/paging.dto';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { NKMethodRouter } from '../core/decorators/NKMethodRouter.decorator';
import { Colors } from '../core/util/colors.helper';
import { User, UserGender, UserStatus } from './user.entity';
import { UserService } from './user.service';

@NKAuthController({
    model: {
        type: User,
    },
    query: {
        relations: ['role', 'department'],
        isShowDelete: false,
    },

    selectOptionField: 'name',
    isAllowDelete: true,
})
export class UserController extends NKCurdControllerBase<User> {
    constructor(private readonly userService: UserService) {
        const reflector = new Reflector();

        userService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, UserController);
        super(userService);
    }

    @NKMethodRouter(Get('/enum-options/gender'))
    getGenderOptions(): EnumListItem[] {
        return [
            {
                id: UserGender.MALE,
                label: 'Nam',
                name: 'Nam',
                value: UserGender.MALE,
                color: Colors.BLUE,
                slug: kebabCase(UserGender.MALE),
            },
            {
                id: UserGender.FEMALE,
                label: 'Nữ',
                name: 'Nữ',
                value: UserGender.FEMALE,
                color: Colors.PINK,
                slug: kebabCase(UserGender.FEMALE),
            },
        ];
    }

    @NKMethodRouter(Get('/enum-options/status'))
    getStatusOptions(): EnumListItem[] {
        return [
            {
                id: UserStatus.ACTIVE,
                label: 'Hoạt động',
                name: 'Hoạt động',
                value: UserStatus.ACTIVE,
                color: Colors.GREEN,
                slug: kebabCase(UserStatus.ACTIVE),
            },
            {
                id: UserStatus.INACTIVE,
                label: 'Không hoạt động',
                name: 'Không hoạt động',
                value: UserStatus.INACTIVE,
                color: Colors.RED,
                slug: kebabCase(UserStatus.INACTIVE),
            },
        ];
    }
}
