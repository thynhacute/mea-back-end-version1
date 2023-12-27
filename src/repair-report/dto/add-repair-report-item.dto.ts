import { ApiProperty, PickType } from '@nestjs/swagger';
import joi from 'joi';
import { RepairReportItem } from '../../repair-report-item/repair-report-item.entity';
import { constant } from '../../core';
import { AddRepairReplaceItemDto } from '../../repair-replace-item/dto/add-repair-replace-item.dto';

export class AddRepairReportItemDto extends PickType(RepairReportItem, ['description', 'imageUrls', 'type'] as const) {
    @ApiProperty({ description: 'Equipment Id' })
    equipmentId: string;

    @ApiProperty({
        description: 'Repair Replace Items',
        type: Array<AddRepairReplaceItemDto>,
        examples: [AddRepairReplaceItemDto.example],
    })
    replaceItems: AddRepairReplaceItemDto[];

    @ApiProperty({
        description: 'Repair Provider Ids',
        type: Array,
        example: ['1'],
    })
    repairProviderIds: string[];

    static validate = joi.object<AddRepairReportItemDto>({
        description: joi.string().required().messages(constant.messageFormat),
        imageUrls: joi.array().items(joi.string()).required().messages(constant.messageFormat),
        equipmentId: joi.string().required().messages(constant.messageFormat),
        repairProviderIds: joi.array().items(joi.string()).required().messages(constant.messageFormat),
        replaceItems: joi.array().items(AddRepairReplaceItemDto.validate).required().messages(constant.messageFormat),
        type: joi.string().required().messages(constant.messageFormat),
    });

    static example = {
        description: 'string',
        imageUrls: ['string'],
        equipmentId: 'string',
        replaceItems: [AddRepairReplaceItemDto.example],
    };
}
