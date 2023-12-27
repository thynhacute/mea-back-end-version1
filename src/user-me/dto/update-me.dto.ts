import { PickType } from '@nestjs/swagger';
import { User } from '../../user/user.entity';
import joi from 'joi';
import { constant } from '../../core';

export class UpdateMeDto extends PickType(User, [
    'address',
    'phone',
    'name',
    'gender',
    'birthday',
    'email',
    'deviceId',
] as const) {
    static validate = joi.object<UpdateMeDto>({
        name: joi.string().max(255).required().messages(constant.messageFormat),
        address: joi.string().max(255).required().messages(constant.messageFormat),
        phone: joi.string().max(255).required().messages(constant.messageFormat),
        gender: joi.string().required().messages(constant.messageFormat),
        birthday: joi.date().required().messages(constant.messageFormat),
        email: joi.string().email().required().messages(constant.messageFormat),
        deviceId: joi.string().max(255).allow('').messages(constant.messageFormat),
    });
}
