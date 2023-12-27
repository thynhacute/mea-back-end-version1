import { ApiProperty } from '@nestjs/swagger';
import joi from 'joi';
import { EquipmentStatusType } from '../../equipment-status/equipment-status.entity';
import { constant } from 'src/core';

export class UpdateEquipmentStatusDTO {
    @ApiProperty({
        description: 'Equipment Category Id',
        example: EquipmentStatusType.ACTIVE,
        enum: EquipmentStatusType,
    })
    status: EquipmentStatusType;

    @ApiProperty({ description: 'Note', example: '123' })
    note: string;

    static validate = joi.object<UpdateEquipmentStatusDTO>({
        status: joi.string().required().messages(constant.messageFormat),
        note: joi.string().allow('').failover('').required().messages(constant.messageFormat),
    });
}
