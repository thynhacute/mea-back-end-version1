import { ApiProperty, PickType } from '@nestjs/swagger';
import joi from 'joi';
import { UserNotification } from '../user-notification.entity';
import { constant } from 'src/core';

export class SendUserNotificationDto extends PickType(UserNotification, [
    'title',
    'content',
    'actionType',
    'actionId',
]) {
    @ApiProperty({
        description: 'Sender id',
        example: '123456789',
    })
    senderId: string;

    @ApiProperty({
        description: 'Receiver id',
        example: ['123456789'],
    })
    receiverIds: string[];

    static validate = joi.object<SendUserNotificationDto>({
        title: joi.string().max(255).required().messages(constant.messageFormat),
        content: joi.string().min(1).required().messages(constant.messageFormat),
        actionType: joi.string().max(255).required().messages(constant.messageFormat),
        actionId: joi.string().max(255).required().messages(constant.messageFormat),
        senderId: joi.string().uuid().allow('').optional(),
        receiverIds: joi.array().items(joi.string().uuid()).min(1).required().messages(constant.messageFormat),
    });
}
