import { PickType } from '@nestjs/swagger';
import joi from 'joi';
import { ExportInventoryItem } from '../../export-inventory-item/export-inventory-item.entity';
import { constant } from 'src/core';

export class UpdateExportInventoryItemDTO extends PickType(ExportInventoryItem, ['quantity', 'note']) {
    static validate = joi.object<UpdateExportInventoryItemDTO>({
        quantity: joi.number().required().min(1).messages(constant.messageFormat),
        note: joi.string().required().allow('').messages(constant.messageFormat),
    });
}
