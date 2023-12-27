import { ApiProperty, PickType } from '@nestjs/swagger';
import { User } from '../../user/user.entity';
import joi from 'joi';
import { joiPasswordExtendCore, JoiPasswordExtend } from 'joi-password';
import { constant } from '../../core';
const joiPassword: JoiPasswordExtend = joi.extend(joiPasswordExtendCore);
export class ResetPasswordDto extends PickType(User, ['password'] as const) {
    @ApiProperty({
        example: '123456',
    })
    token: string;

    static validate = joi.object<ResetPasswordDto>({
        password: joiPassword
            .string()
            .min(8)
            .max(255)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .minOfNumeric(1)
            .required()
            .messages(constant.messageFormat),
        token: joi
            .string()

            .required()
            .messages(constant.messageFormat),
    });
}
