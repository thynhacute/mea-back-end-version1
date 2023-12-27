import { Injectable } from '@nestjs/common';
import { NKGlobal } from '../core/common/NKGlobal';
import { UserNotification, UserNotificationStatus } from '../user-notification/user-notification.entity';
import { User } from '../user/user.entity';

@Injectable()
export class UserMeNotificationService {
    async markAsRead(user: User) {
        return await NKGlobal.entityManager.update(
            UserNotification,
            {
                user: {
                    id: user.id,
                },
                status: UserNotificationStatus.UNREAD,
                isDeleted: false,
            },
            { status: UserNotificationStatus.READ },
        );
    }

    async markAsReadDetail(notificationId: string) {
        return await NKGlobal.entityManager.update(
            UserNotification,
            {
                id: notificationId,
                isDeleted: false,
            },
            { status: UserNotificationStatus.READ_DETAIL },
        );
    }

    async countUnread(user: User) {
        return await NKGlobal.entityManager.count(UserNotification, {
            user: {
                id: user.id,
            },
            status: UserNotificationStatus.UNREAD,
            isDeleted: false,
        });
    }
}
