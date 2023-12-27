import { PickType } from '@nestjs/swagger';
import joi from 'joi';
import { ImportPlan } from '../import-plan.entity';
import { constant } from 'src/core';

export class UpdateStatusImportPlanDTO extends PickType(ImportPlan, ['note']) {
    static validate = joi.object<UpdateStatusImportPlanDTO>({
        note: joi.string().allow('').messages(constant.messageFormat),
    });
}
