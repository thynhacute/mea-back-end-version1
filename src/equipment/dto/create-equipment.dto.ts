import { ApiProperty, PickType } from '@nestjs/swagger';
import { Equipment } from '../equipment.entity';
import { EquipmentStatus, EquipmentStatusType } from '../../equipment-status/equipment-status.entity';
import joi from 'joi';
import { constant } from 'src/core';

export class CreateEquipmentDTO extends PickType(Equipment, [
    'name',
    'code',
    'description',
    'mfDate',
    'importDate',
    'endOfWarrantyDate',
    'imageUrls',
]) {
    @ApiProperty({ description: 'Equipment Status', example: EquipmentStatusType.ACTIVE, enum: EquipmentStatusType })
    equipmentStatus: EquipmentStatusType;

    @ApiProperty({ description: 'Equipment Category Id', example: '123' })
    equipmentCategoryId: string;

    @ApiProperty({ description: 'Brand Id', example: '123' })
    brandId: string;

    static validate = joi.object<CreateEquipmentDTO>({
        name: joi.string().required().messages(constant.messageFormat),
        code: joi.string().required().messages(constant.messageFormat),
        description: joi.string().allow('').required().messages(constant.messageFormat),
        mfDate: joi.date().required().messages(constant.messageFormat),
        importDate: joi.date().required().messages(constant.messageFormat),
        endOfWarrantyDate: joi.date().required().messages(constant.messageFormat),
        imageUrls: joi.array().items(joi.string()).required().messages(constant.messageFormat),
        equipmentStatus: joi
            .string()
            .valid(...Object.values(EquipmentStatusType))
            .required()
            .messages(constant.messageFormat),
        equipmentCategoryId: joi.string().required().messages(constant.messageFormat),
        brandId: joi.string().required().messages(constant.messageFormat),
    });
}
