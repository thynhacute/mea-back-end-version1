import { ApiProperty, PickType } from '@nestjs/swagger';
import joi from 'joi';
import { joiPasswordExtendCore, JoiPasswordExtend } from 'joi-password';
import { User } from '../../user/user.entity';
import { constant } from '../../core';
const joiPassword: JoiPasswordExtend = joi.extend(joiPasswordExtendCore);

export class CreateStockerDto extends PickType(User, ['username', 'password', 'startWorkDate'] as const) {
    static validate = joi.object<CreateStockerDto>({
        username: joi.string().max(255).required().messages(constant.messageFormat),
        password: joiPassword
            .string()
            .min(8)
            .max(255)
            .minOfLowercase(1)
            .minOfUppercase(1)
            .minOfNumeric(1)
            .required()
            .messages(constant.messageFormat),
        startWorkDate: joi.date().required().messages(constant.messageFormat),
    });
}
