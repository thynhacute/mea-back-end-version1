import { HttpStatus, Injectable, Scope } from '@nestjs/common';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { NKService } from '../core/decorators/NKService.decorator';
import { UserNotification, UserNotificationStatus } from './user-notification.entity';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, In } from 'typeorm';
import { SendUserNotificationDto } from './dto/send-user-notification.dto';
import { UserService } from '../user/user.service';
import { NKEntity } from '../core/decorators/NKEntity';
import { NKResponseException, nkMessage } from '../core/exception';
import { UserRoleIndex } from '../user-role/user-role.constant';
import { genUUID } from '../core/util';
import { UserRole } from '../user-role/user-role.entity';
import { NKGlobal } from '../core/common/NKGlobal';
import { User } from '../user/user.entity';
import { FirebaseService } from 'src/core/provider/firebase/firebase.service';

@Injectable({
    scope: Scope.DEFAULT,
})
export class UserNotificationService extends NKServiceBase<UserNotification> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
        private readonly userService: UserService,
        private readonly firebaseService: FirebaseService,
    ) {
        super(entityManager.getRepository(UserNotification));
    }

    async sendNotification(dto: SendUserNotificationDto) {
        const users = await this.userService.getManyByField('id', dto.receiverIds);
        if (users.length !== dto.receiverIds.length) {
            return new NKResponseException(nkMessage.error.notFound, HttpStatus.BAD_REQUEST, {
                entity: 'User',
            });
        }

        await Promise.all(
            users.map(async (user) => {
                if (user.deviceId) {
                    await this.firebaseService.sendNotification(user.deviceId, 'high', dto.title, dto.content, {
                        actionType: dto.actionType,
                        actionId: dto.actionId,
                    });
                }
            }),
        );

        return await this.entityManager.save(
            UserNotification,
            users.map((user) => ({
                actionType: dto.actionType,
                actionId: dto.actionId,
                content: dto.content,
                title: dto.title,
                status: UserNotificationStatus.UNREAD,
                user: {
                    id: user.id,
                },
                sender: dto.senderId ? { id: dto.senderId } : null,
            })),
        );
    }

    async sendNotificationByRole(userRoleIndexList: UserRoleIndex[], dto: SendUserNotificationDto) {
        const users = await NKGlobal.entityManager.find(User, {
            where: {
                role: {
                    id: In(userRoleIndexList.map((userRoleIndex) => genUUID(UserRole.name, userRoleIndex))),
                },
            },
            relations: ['role'],
        });

        await Promise.all(
            users.map(async (user) => {
                if (user.deviceId) {
                    await this.firebaseService.sendNotification(user.deviceId, 'high', dto.title, dto.content, {
                        actionType: dto.actionType,
                        actionId: dto.actionId,
                    });
                }
            }),
        );

        return await this.entityManager.save(
            UserNotification,
            users.map((user) => ({
                actionType: dto.actionType,
                actionId: dto.actionId,
                content: dto.content,
                title: dto.title,
                status: UserNotificationStatus.UNREAD,
                user: {
                    id: user.id,
                },
                sender: dto.senderId ? { id: dto.senderId } : null,
            })),
        );
    }
}
