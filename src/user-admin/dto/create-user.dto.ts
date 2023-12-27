import { ApiProperty, PickType } from '@nestjs/swagger';

import { User } from '../../user/user.entity';
import joi from 'joi';

import { joiPasswordExtendCore, JoiPasswordExtend } from 'joi-password';
import { constant } from '../../core/constant';
const joiPassword: JoiPasswordExtend = joi.extend(joiPasswordExtendCore);

export class CreateUserDto extends PickType(User, ['username', 'password', 'startWorkDate'] as const) {
    @ApiProperty({
        example: '123456',
    })
    roleId: string;

    @ApiProperty({
        example: '123456',
    })
    departmentId: string;

    static validate = joi.object<CreateUserDto>({
        username: joi.string().max(255).required().messages(constant.messageFormat),
        startWorkDate: joi.date().required().messages(constant.messageFormat),
        departmentId: joi.string().uuid().allow('').messages(constant.messageFormat),
        roleId: joi.string().uuid().required().messages(constant.messageFormat),
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
