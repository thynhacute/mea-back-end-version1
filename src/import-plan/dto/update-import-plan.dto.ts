import { PickType } from '@nestjs/swagger';
import joi from 'joi';
import { ImportPlan } from '../import-plan.entity';
import { constant } from 'src/core';
import { today } from 'src/core/util';

export class UpdateImportPlanDTO extends PickType(ImportPlan, ['startImportDate', 'endImportDate', 'name']) {
    static validate = joi.object<UpdateImportPlanDTO>({
        startImportDate: joi
            .date()
            .min(today())
            .required()
            .messages({
                ...constant.messageFormat,
                'date.min': 'phải lớn hơn ngày hiện tại',
            }),
        name: joi.string().required().messages(constant.messageFormat),
        endImportDate: joi
            .date()
            .required()
            .greater(joi.ref('startImportDate'))
            .messages({ ...constant.messageFormat, 'date.greater': 'phải lớn hơn ngày bắt đầu' }),
    });
}
