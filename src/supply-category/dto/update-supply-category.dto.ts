import { PickType } from '@nestjs/swagger';

import joi from 'joi';
import { constant } from '../../core';
import { SupplyCategory } from '../supply-category.entity';

export class UpdateSupplyCategoryDto extends PickType(SupplyCategory, ['name', 'description'] as const) {
    static validate = joi.object<UpdateSupplyCategoryDto>({
        description: joi.string().required().messages(constant.messageFormat),
        name: joi.string().max(255).required().messages(constant.messageFormat),
    });
}
