import { ApiProperty, PickType } from '@nestjs/swagger';
import joi from 'joi';
import { ExportInventory } from '../export-inventory.entity';
import { constant } from 'src/core';
import { today } from 'src/core/util';

export class CreateExportInventoryDTO extends PickType(ExportInventory, ['exportDate', 'note']) {
    @ApiProperty({ description: 'Department Id' })
    departmentId: string;

    @ApiProperty({ description: 'import request Id' })
    importRequestId: string;

    static validate = joi.object<CreateExportInventoryDTO>({
        departmentId: joi.string().allow('').messages(constant.messageFormat),
        exportDate: joi
            .date()
            .required()
            .min(today())
            .messages({ ...constant.messageFormat, 'date.min': 'phải lớn hơn ngày hiện tại' }),
        note: joi.string().required().messages(constant.messageFormat),
        importRequestId: joi.string().allow('').required().messages(constant.messageFormat),
    });
}
