import { ApiProperty, PickType } from '@nestjs/swagger';
import joi from 'joi';
import { constant } from '../../core';
import { RepairReportItem } from '../../repair-report-item/repair-report-item.entity';

export class UpdateRepairReportItemDto extends PickType(RepairReportItem, [
    'description',
    'imageUrls',
    'type',
    'status',
] as const) {
    @ApiProperty({
        description: 'Repair Provider Ids',
        type: Array,
        example: ['1'],
    })
    repairProviderIds: string[];

    static validate = joi.object<UpdateRepairReportItemDto>({
        description: joi.string().required().messages(constant.messageFormat),
        imageUrls: joi.array().items(joi.string()).required().messages(constant.messageFormat),
        type: joi.string().required().messages(constant.messageFormat),
        status: joi.string().required().messages(constant.messageFormat),

        repairProviderIds: joi.array().items(joi.string()).required().messages(constant.messageFormat),
    });
}
