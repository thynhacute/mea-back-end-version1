import { PickType } from '@nestjs/swagger';
import joi from 'joi';
import { constant } from '../../core';
import { RepairReport } from '../repair-report.entity';
import { today } from 'src/core/util';

export class UpdateRepairReportDto extends PickType(RepairReport, [
    'description',
    'startAt',
    'endAt',
    'status',
    'note',
    'price',
    'brokenDate',
] as const) {
    static validate = joi.object<UpdateRepairReportDto>({
        description: joi.string().allow('').required().messages(constant.messageFormat),
        startAt: joi
            .date()
            .required()
            .min(today())
            .messages({ ...constant.messageFormat, 'date.min': 'phải lớn hơn ngày hiện tại' }),
        endAt: joi
            .date()
            .required()
            .greater(joi.ref('startAt'))
            .messages({ ...constant.messageFormat, 'date.greater': 'phải lớn hơn ngày bắt đầu' }),

        note: joi.string().allow('').required().messages(constant.messageFormat),
        status: joi.string().required().messages(constant.messageFormat),
        brokenDate: joi.date().allow(null).required().messages(constant.messageFormat),
        price: joi.number().required().messages(constant.messageFormat),
    });
}
