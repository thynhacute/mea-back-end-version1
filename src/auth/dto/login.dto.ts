import { PickType } from '@nestjs/swagger';
import { User } from '../../user/user.entity';
import { joiPasswordExtendCore, JoiPasswordExtend } from 'joi-password';
import joi from 'joi';
import { constant } from '../../core';
const joiPassword: JoiPasswordExtend = joi.extend(joiPasswordExtendCore);

export class LoginWithEmailDto extends PickType(User, ['password', 'email']) {
    static validate = joi.object<LoginWithEmailDto>({
        email: joi.string().max(255).email().required().messages(constant.messageFormat),
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

export class LoginWithUsernameDto extends PickType(User, ['password', 'username']) {
    static validate = joi.object<LoginWithUsernameDto>({
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
    });
}
