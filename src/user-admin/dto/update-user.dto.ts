import { ApiProperty, PickType } from '@nestjs/swagger';

import { User } from '../../user/user.entity';
import joi from 'joi';
import { joiPasswordExtendCore, JoiPasswordExtend } from 'joi-password';
import { constant } from '../../core';
const joiPassword: JoiPasswordExtend = joi.extend(joiPasswordExtendCore);
export class UpdateUserDto extends PickType(User, [
    'name',
    'address',
    'phone',
    'citizenId',
    'birthday',
    'gender',
    'status',
    'startWorkDate',
] as const) {
    @ApiProperty({
        example: '123456',
    })
    roleId: string;

    @ApiProperty({
        example: '123456',
    })
    password: string;

    @ApiProperty({
        example: '123456',
    })
    departmentId: string;

    static validate = joi.object<UpdateUserDto>({
        name: joi.string().max(255).required().messages(constant.messageFormat),
        address: joi.string().required().messages(constant.messageFormat),
        phone: joi.string().required().messages(constant.messageFormat),
        citizenId: joi.string().required().messages(constant.messageFormat),
        birthday: joi.date().required().messages(constant.messageFormat),
        gender: joi.string().required().messages(constant.messageFormat),
        status: joi.string().required().messages(constant.messageFormat),
        roleId: joi.string().uuid().required().messages(constant.messageFormat),
        password: joiPassword
            .string()

            .allow('')
            .messages(constant.messageFormat),
        startWorkDate: joi.date().required().messages(constant.messageFormat),
        departmentId: joi.string().uuid().required().messages(constant.messageFormat),
    });
}
