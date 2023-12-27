import { Controller, Get, Param, ParseUUIDPipe, Put, Query, Req } from '@nestjs/common';
import { UserMeNotificationService } from './user-me-notification.service';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { NKRouter } from '../core/decorators/NKRouter.decorator';
import { Request } from 'express';
import { QueryJoiValidatorPipe } from '../core/pipe';
import { PagingFilter, PagingFilterDto } from '../core/common/dtos/paging.dto';
import { CompareOperator } from '../core/interface';
import { UserNotificationService } from '../user-notification/user-notification.service';

@NKAuthController({
    apiName: 'user-me-notification',
})
export class UserMeNotificationController {
    constructor(
        private readonly userNotificationService: UserNotificationService,
        private readonly userMeNotificationService: UserMeNotificationService,
    ) {}

    @NKRouter({
        method: Get('/'),
    })
    async getMeNotifications(
        @Query(new QueryJoiValidatorPipe(PagingFilterDto.validate))
        query: PagingFilter,
        @Req() req: Request,
    ) {
        const count = await this.userMeNotificationService.countUnread(req.user);

        const res = await this.userNotificationService.getPaging({
            orderBy: query.orderBy,
            page: query.page,
            filters: [
                {
                    field: 'user.id',
                    comparator: CompareOperator.EQUAL.toString(),
                    value: req.user.id,
                },
                ...query.filters,
            ],
            pageSize: query.pageSize,
        });

        return {
            ...res,
            countUnread: count,
        };
    }

    @NKRouter({
        method: Put('/mark-as-read'),
    })
    async markAsRead(@Req() req: Request) {
        return this.userMeNotificationService.markAsRead(req.user);
    }

    @NKRouter({
        method: Put('/mark-as-read-detail/:notificationId'),
    })
    async markAsReadDetail(
        @Param('notificationId', new ParseUUIDPipe())
        notificationId: string,
    ) {
        return this.userMeNotificationService.markAsReadDetail(notificationId);
    }
}
