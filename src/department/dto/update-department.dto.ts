import { PickType } from '@nestjs/swagger';
import { Department } from '../department.entity';
import joi from 'joi';
import { constant } from '../../core';

export class UpdateDepartmentDto extends PickType(Department, ['name', 'description', 'status'] as const) {
    static validate = joi.object<UpdateDepartmentDto>({
        description: joi.string().required().messages(constant.messageFormat),
        name: joi.string().max(255).required().messages(constant.messageFormat),
        status: joi.string().required().allow(null, '').messages(constant.messageFormat),
    });
}
