import { ApiProperty, PickType } from '@nestjs/swagger';
import joi from 'joi';
import { ImportInventory } from '../import-inventory.entity';
import { constant } from 'src/core';

export class UpdateStatusImportInventoryDTO extends PickType(ImportInventory, ['note']) {
    static validate = joi.object<UpdateStatusImportInventoryDTO>({
        note: joi.string().required().messages(constant.messageFormat),
    });
}
