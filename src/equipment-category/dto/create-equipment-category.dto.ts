import { PickType } from '@nestjs/swagger';

import joi from 'joi';

import { constant } from '../../core';
import { EquipmentCategory } from '../equipment-category.entity';

export class CreateEquipmentCategoryDto extends PickType(EquipmentCategory, ['name', 'description', 'code'] as const) {
    static validate = joi.object<CreateEquipmentCategoryDto>({
        description: joi.string().required().messages(constant.messageFormat),
        name: joi.string().max(255).required().messages(constant.messageFormat),
        code: joi.string().max(255).required().messages(constant.messageFormat),
    });
}
