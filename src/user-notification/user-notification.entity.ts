import { NKEntityBase } from '../core/common/NKEntityBase';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { User } from '../user/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { NKEntity } from '../core/decorators/NKEntity';

export enum UserNotificationActionType {
    TEXT = 'TEXT',
    LINK = 'LINK',
    REPAIR_REPORT_LINK = 'REPAIR_REPORT_LINK',
    IMPORT_PLAN_LINK = 'IMPORT_PLAN_LINK',
    IMPORT_REQUEST_LINK = 'IMPORT_REQUEST_LINK',
    EXPORT_INVENTORY_LINK = 'EXPORT_INVENTORY_LINK',
    MAINTENANCE_SCHEDULE = 'MAINTENANCE_SCHEDULE',
}

export enum UserNotificationStatus {
    UNREAD = 'UNREAD',
    READ = 'READ',
    READ_DETAIL = 'READ_DETAIL',
}

@NKEntity({
    displayName: 'Thông báo',
})
export class UserNotification extends NKEntityBase {
    @Column({ default: '' })
    @ApiProperty({
        description: 'Action type',
        example: UserNotificationActionType.TEXT,
        enum: UserNotificationActionType,
    })
    actionType: UserNotificationActionType;

    @Column({ default: '' })
    @ApiProperty({
        description: 'Action id',
        example: '123456789',
    })
    actionId: string;

    @Column({ default: '' })
    @ApiProperty({
        description: 'Content',
        example: 'Hello world',
    })
    content: string;

    @Column({ default: '' })
    @ApiProperty({
        description: 'Title',
        example: 'Hello world',
    })
    title: string;

    @Column({ default: UserNotificationStatus.UNREAD })
    @ApiProperty({
        description: 'Status',
        example: UserNotificationStatus.UNREAD,
        enum: UserNotificationStatus,
    })
    status: UserNotificationStatus;

    @ManyToOne(() => User, (user) => user.userNotifications, {
        cascade: true,
    })
    user: User;

    @ManyToOne(() => User, (user) => user.sendNotifications, {})
    sender: User;
}
