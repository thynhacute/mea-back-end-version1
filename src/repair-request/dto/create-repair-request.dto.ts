import { ApiProperty, PickType } from '@nestjs/swagger';

import joi from 'joi';

import { constant } from '../../core';
import { RepairRequest } from '../repair-request.entity';

export class CreateRepairRequestDto extends PickType(RepairRequest, ['description', 'imageUrls'] as const) {
    @ApiProperty({ description: 'Equipment Id', example: '123' })
    equipmentId: string;

    static validate = joi.object<CreateRepairRequestDto>({
        description: joi.string().required().messages(constant.messageFormat),
        imageUrls: joi.array().items(joi.string()).required().messages(constant.messageFormat),
        equipmentId: joi.string().required().messages(constant.messageFormat),
    });
}
