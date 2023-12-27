import { PickType } from '@nestjs/swagger';

import joi from 'joi';
import { Department } from '../department.entity';
import { constant } from '../../core';

export class CreateDepartmentDto extends PickType(Department, ['name', 'description'] as const) {
    static validate = joi.object<CreateDepartmentDto>({
        description: joi.string().required().messages(constant.messageFormat),
        name: joi.string().max(255).required().messages(constant.messageFormat),
    });
}
