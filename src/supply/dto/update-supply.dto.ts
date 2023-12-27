import { ApiProperty, PickType } from '@nestjs/swagger';
import joi from 'joi';
import { Supply } from '../supply.entity';
import { constant } from 'src/core';

export class UpdateSupplyDTO extends PickType(Supply, ['name', 'code', 'description', 'imageUrls', 'status', 'unit']) {
    @ApiProperty({ description: 'Brand Id', example: '123' })
    brandId: string;

    @ApiProperty({ description: 'Supply Category Id', example: '123' })
    supplyCategoryId: string;

    @ApiProperty({ description: 'Equipment Id', example: '123' })
    equipmentCategoryId: string;

    static validate = joi.object<UpdateSupplyDTO>({
        name: joi.string().required().messages(constant.messageFormat),
        code: joi.string().required().messages(constant.messageFormat),
        description: joi.string().required().messages(constant.messageFormat),
        imageUrls: joi.array().items(joi.string()).required().messages(constant.messageFormat),
        status: joi.string().required().messages(constant.messageFormat),
        unit: joi.string().required().messages(constant.messageFormat),
        brandId: joi.string().uuid().required().messages(constant.messageFormat),
        supplyCategoryId: joi.string().uuid().required().messages(constant.messageFormat),
        equipmentCategoryId: joi.string().uuid().allow('').required().messages(constant.messageFormat),
    });
}
