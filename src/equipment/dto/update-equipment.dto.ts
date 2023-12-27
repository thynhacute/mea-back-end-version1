import { ApiProperty, PickType } from '@nestjs/swagger';
import joi from 'joi';
import { Equipment } from '../equipment.entity';
import { constant } from 'src/core';

export class UpdateEquipmentDTO extends PickType(Equipment, [
    'name',
    'code',
    'description',
    'mfDate',
    'importDate',
    'endOfWarrantyDate',
    'imageUrls',
]) {
    @ApiProperty({ description: 'Equipment Category Id', example: '123' })
    equipmentCategoryId: string;

    @ApiProperty({ description: 'Brand Id', example: '123' })
    brandId: string;

    static validate = joi.object<UpdateEquipmentDTO>({
        name: joi.string().required().messages(constant.messageFormat),
        code: joi.string().required().messages(constant.messageFormat),
        description: joi.string().required().messages(constant.messageFormat),
        mfDate: joi.date().required().messages(constant.messageFormat),
        importDate: joi.date().required().messages(constant.messageFormat),
        endOfWarrantyDate: joi.date().required().messages(constant.messageFormat),
        imageUrls: joi.array().items(joi.string()).required().messages(constant.messageFormat),
        equipmentCategoryId: joi.string().required().messages(constant.messageFormat),
        brandId: joi.string().required().messages(constant.messageFormat),
    });
}
