import { ApiProperty, PickType } from '@nestjs/swagger';
import joi from 'joi';
import { constant } from '../../core';
import { RepairReplaceItem } from '../repair-replace-item.entity';

export class UpdateRepairReplaceItemDto extends PickType(RepairReplaceItem, ['quantity'] as const) {
    static validate = joi.object<UpdateRepairReplaceItemDto>({
        quantity: joi.number().required().messages(constant.messageFormat),
    });

    static example = {
        quantity: 0,
    };
}
