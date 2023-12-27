import { PickType } from '@nestjs/swagger';

import joi from 'joi';
import { constant } from '../../core';
import { Brand } from '../brand.entity';

export class UpdateBrandDto extends PickType(Brand, ['name', 'description', 'imageUrl', 'code', 'status'] as const) {
    static validate = joi.object<UpdateBrandDto>({
        code: joi.string().required().messages(constant.messageFormat),
        description: joi.string().required().messages(constant.messageFormat),
        imageUrl: joi.string().required().messages(constant.messageFormat),
        name: joi.string().max(255).required().messages(constant.messageFormat),
        status: joi.string().required().messages(constant.messageFormat),
    });
}
