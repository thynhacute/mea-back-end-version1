import { ApiProperty, PickType } from '@nestjs/swagger';
import joi from 'joi';
import { ImportInventory } from '../import-inventory.entity';
import { constant } from 'src/core';
import { today } from 'src/core/util';

export class UpdateImportInventoryDTO extends PickType(ImportInventory, ['note', 'importDate', 'name']) {
    @ApiProperty({ description: 'Import Plan Id' })
    importPlanId: string;

    static validate = joi.object<UpdateImportInventoryDTO>({
        note: joi.string().required().messages(constant.messageFormat),
        importDate: joi
            .date()
            .min(today())
            .required()
            .messages({
                ...constant.messageFormat,
                'date.min': 'phải lớn hơn ngày hiện tại',
            }),
        name: joi.string().required().messages(constant.messageFormat),
        importPlanId: joi.string().allow('').required().messages(constant.messageFormat),
    });
}
