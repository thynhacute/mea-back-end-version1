import { ApiProperty, PickType } from '@nestjs/swagger';

import { User } from '../../user/user.entity';
import joi from 'joi';
import { joiPasswordExtendCore, JoiPasswordExtend } from 'joi-password';
import { constant } from '../../core';
const joiPassword: JoiPasswordExtend = joi.extend(joiPasswordExtendCore);
export class ChangePasswordDto extends PickType(User, ['password'] as const) {
    @ApiProperty({
        example: '123456',
    })
    newPassword: string;

    static validate = joi.object<ChangePasswordDto>({
        newPassword: joiPassword
            .string()
            .min(8)
            .max(255)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .minOfNumeric(1)
            .required()
            .messages(constant.messageFormat),
        password: joiPassword
            .string()
            .min(8)
            .max(255)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .minOfNumeric(1)
            .required()
            .messages(constant.messageFormat),
    });
}
