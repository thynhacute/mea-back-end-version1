import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NKGlobal } from '../core/common/NKGlobal';
import { NKLOGGER_NS, nkLogger } from '../core/logger';
import { genUUID } from '../core/util';
import { SendUserNotificationDto } from '../user-notification/dto/send-user-notification.dto';
import {
    UserNotification,
    UserNotificationActionType,
    UserNotificationStatus,
} from '../user-notification/user-notification.entity';
import { UserRoleIndex } from '../user-role/user-role.constant';
import { UserRole } from '../user-role/user-role.entity';
import { User } from '../user/user.entity';
import { EquipmentMaintainSchedule } from './equipment-maintain-schedule.entity';

@Injectable()
export class EquipmentMaintainScheduleCron {
    constructor() {}

    // async sendNotificationByRole(userRoleIndex: UserRoleIndex, dto: SendUserNotificationDto) {
    //     const users = await NKGlobal.entityManager.find(User, {
    //         where: {
    //             role: {
    //                 id: genUUID(UserRole.name, userRoleIndex),
    //             },
    //         },
    //         relations: ['role'],
    //     });

    //     return await NKGlobal.entityManager.save(
    //         UserNotification,
    //         users.map((user) => ({
    //             actionType: dto.actionType,
    //             actionId: dto.actionId,
    //             content: dto.content,
    //             title: dto.title,
    //             status: UserNotificationStatus.UNREAD,
    //             user: {
    //                 id: user.id,
    //             },
    //             sender: dto.senderId ? { id: dto.senderId } : null,
    //         })),
    //     );
    // }
    // async getAllScheduleHasNextMaintainDate() {
    //     const equipmentMaintainSchedules = await NKGlobal.entityManager
    //         .createQueryBuilder(EquipmentMaintainSchedule, 'equipmentMaintainSchedule')
    //         .leftJoinAndSelect('equipmentMaintainSchedule.equipment', 'equipment')
    //         // not null and not zero
    //         .where(
    //             'equipmentMaintainSchedule.cycleMaintainPerMonth IS NOT NULL AND equipmentMaintainSchedule.cycleMaintainPerMonth > 0',
    //         )
    //         .getMany();

    //     // check last notify date is less than today
    //     // check last maintain date + cycle maintain per month is less than today
    //     return equipmentMaintainSchedules.filter((equipmentMaintainSchedule) => {
    //         const lastMaintainDate = new Date(equipmentMaintainSchedule.lastMaintainDate);
    //         const nextMaintainDate = new Date(
    //             lastMaintainDate.setMonth(
    //                 lastMaintainDate.getMonth() + equipmentMaintainSchedule.cycleMaintainPerMonth,
    //             ),
    //         );
    //         const today = new Date();
    //         today.setDate(today.getDate() + 1);

    //         return nextMaintainDate <= today && equipmentMaintainSchedule.lastNotifyDate < today;
    //     });
    // }

    // @Cron(CronExpression.EVERY_MINUTE)
    // async handleCron() {
    //     nkLogger(NKLOGGER_NS.APP_CRON, `EquipmentMaintainScheduleCron is checking to push notification`);

    //     const equipmentMaintainSchedules = await this.getAllScheduleHasNextMaintainDate();

    //     await Promise.all(
    //         equipmentMaintainSchedules.map(async (equipmentMaintainSchedule) => {
    //             await this.sendNotificationByRole(UserRoleIndex.MAINTENANCE_MANAGER, {
    //                 actionId: equipmentMaintainSchedule.id,
    //                 actionType: UserNotificationActionType.MAINTENANCE_SCHEDULE,
    //                 content: `Thiết bị ${equipmentMaintainSchedule.equipment.name} cần được bảo trì`,
    //                 title: `Thông báo bảo trì thiết bị`,
    //                 receiverIds: [],
    //                 senderId: null,
    //             });

    //             await NKGlobal.entityManager.update(
    //                 EquipmentMaintainSchedule,
    //                 {
    //                     id: equipmentMaintainSchedule.id,
    //                 },
    //                 {
    //                     lastNotifyDate: new Date(),
    //                 },
    //             );
    //         }),
    //     );
    // }
}
