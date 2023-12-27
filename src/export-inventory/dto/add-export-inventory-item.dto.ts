import { ApiProperty, PickType } from '@nestjs/swagger';
import joi from 'joi';
import { ExportInventoryItem } from '../../export-inventory-item/export-inventory-item.entity';
import { constant } from 'src/core';

export class AddExportInventoryItemDTO extends PickType(ExportInventoryItem, ['quantity', 'note']) {
    @ApiProperty({ description: 'Supply Id' })
    supplyId: string;

    @ApiProperty({ description: 'Equipment Id' })
    equipmentId: string;

    static validate = joi.object<AddExportInventoryItemDTO>({
        supplyId: joi.string().allow(null).required().messages(constant.messageFormat),
        equipmentId: joi.string().allow(null).required().messages(constant.messageFormat),
        quantity: joi.number().min(1).required().messages(constant.messageFormat),
        note: joi.string().required().allow('').messages(constant.messageFormat),
    });
}
