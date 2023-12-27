import { ApiProperty, PickType } from '@nestjs/swagger';
import joi from 'joi';
import { constant } from '../../core';
import { RepairReplaceItem } from '../repair-replace-item.entity';

export class AddRepairReplaceItemDto extends PickType(RepairReplaceItem, ['quantity'] as const) {
    @ApiProperty({ description: 'Supply Id', example: '1' })
    supplyId: string;

    static validate = joi.object<AddRepairReplaceItemDto>({
        quantity: joi.number().required().messages(constant.messageFormat),
        supplyId: joi.string().required().messages(constant.messageFormat),
    });

    static example = {
        quantity: 0,
        supplyId: '123',
    };
}
