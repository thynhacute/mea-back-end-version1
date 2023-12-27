import { PickType } from '@nestjs/swagger';
import joi from 'joi';
import { ExportInventory } from '../export-inventory.entity';
import { constant } from 'src/core';

export class UpdateStatusExportInventoryDTO extends PickType(ExportInventory, ['note']) {
    static validate = joi.object<UpdateStatusExportInventoryDTO>({
        note: joi.string().required().messages(constant.messageFormat),
    });
}
