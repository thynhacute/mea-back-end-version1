import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserNotificationService } from './user-notification.service';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { UserNotification, UserNotificationActionType, UserNotificationStatus } from './user-notification.entity';
import { RouterBaseMethodEnum } from '../core/enum/RouterBaseMethodEnum';
import { NKCurdControllerBase } from '../core/common/NKCurdControllerBase';
import { Reflector } from '@nestjs/core';
import { NKKey } from '../core/common/NKKey';
import { NKMethodRouter } from '../core/decorators/NKMethodRouter.decorator';
import { EnumListItem } from '../core/common/dtos/paging.dto';
import { UserStatus } from '../user/user.entity';
import { Colors } from '../core/util/colors.helper';
import { kebabCase } from 'lodash';
import { SendUserNotificationDto } from './dto/send-user-notification.dto';
import { JoiValidatorPipe } from '../core/pipe';

@NKAuthController({
    model: {
        type: UserNotification,
    },
    baseMethods: [RouterBaseMethodEnum.DELETE_ONE],
    query: {
        relations: ['sender'],
    },
    isAllowDelete: true,
})
export class UserNotificationController extends NKCurdControllerBase<UserNotification> {
    constructor(private readonly userNotificationService: UserNotificationService) {
        const reflector = new Reflector();

        userNotificationService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, UserNotificationController);
        super(userNotificationService);
    }

    @NKMethodRouter(Post('/send'))
    sendNotification(@Body(new JoiValidatorPipe(SendUserNotificationDto.validate)) body: SendUserNotificationDto) {
        return this.userNotificationService.sendNotification(body);
    }

    @NKMethodRouter(Get('/enum-options/action-type'))
    getTypeOptions(): EnumListItem[] {
        return [
            {
                id: UserNotificationActionType.LINK,
                label: 'Link',
                name: 'Link',
                value: UserNotificationActionType.LINK,
                color: Colors.BLUE,
                slug: kebabCase(UserNotificationActionType.LINK),
            },
            {
                id: UserNotificationActionType.TEXT,
                label: 'Nội dung',
                name: 'Nội dung',
                value: UserNotificationActionType.TEXT,
                color: Colors.BLACK,
                slug: kebabCase(UserNotificationActionType.TEXT),
            },
            {
                id: UserNotificationActionType.MAINTENANCE_SCHEDULE,
                label: 'Lịch bảo trì',
                name: 'Lịch bảo trì',
                value: UserNotificationActionType.MAINTENANCE_SCHEDULE,
                color: Colors.YELLOW,
                slug: kebabCase(UserNotificationActionType.MAINTENANCE_SCHEDULE),
            },
        ];
    }

    @NKMethodRouter(Get('/enum-options/status'))
    getStatusOptions(): EnumListItem[] {
        return [
            {
                color: Colors.GREEN,
                id: UserNotificationStatus.READ,
                label: 'Đã đọc',
                name: 'Đã đọc',
                slug: kebabCase(UserNotificationStatus.READ),
                value: UserNotificationStatus.READ,
            },
            {
                color: Colors.GREY,
                id: UserNotificationStatus.UNREAD,
                label: 'Chưa đọc',
                name: 'Chưa đọc',
                slug: kebabCase(UserNotificationStatus.UNREAD),
                value: UserNotificationStatus.UNREAD,
            },
            {
                color: Colors.BLUE,
                id: UserNotificationStatus.READ_DETAIL,
                label: 'Đã đọc chi tiết',
                name: 'Đã đọc chi tiết',
                slug: kebabCase(UserNotificationStatus.READ_DETAIL),
                value: UserNotificationStatus.READ_DETAIL,
            },
        ];
    }
}
