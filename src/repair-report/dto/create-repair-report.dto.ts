import { ApiProperty, PickType } from '@nestjs/swagger';
import joi from 'joi';
import { constant } from '../../core';
import { RepairReport } from '../repair-report.entity';
import { AddRepairReportItemDto } from './add-repair-report-item.dto';
import { today } from 'src/core/util';

export class CreateRepairReportDto extends PickType(RepairReport, [
    'description',
    'startAt',
    'endAt',
    'note',
    'price',
    'brokenDate',
] as const) {
    @ApiProperty({ description: 'Repair Report Item', example: [AddRepairReportItemDto.example] })
    repairReportItems: AddRepairReportItemDto[];

    static validate = joi.object<CreateRepairReportDto>({
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
        repairReportItems: joi
            .array()
            .items(AddRepairReportItemDto.validate)
            .required()
            .messages(constant.messageFormat),
        brokenDate: joi.date().allow(null).required().messages(constant.messageFormat),
        price: joi.number().required().messages(constant.messageFormat),
    });
}
