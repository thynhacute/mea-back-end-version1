import { ApiProperty, PickType } from '@nestjs/swagger';
import joi from 'joi';
import { ImportInventoryItem } from '../../import-inventory-item/import-inventory-item.entity';
import { constant } from 'src/core';
import { today } from 'src/core/util';

export class AddImportInventoryItemDTO extends PickType(ImportInventoryItem, [
    'quantity',
    'mfDate',
    'expiredDate',
    'endOfWarrantyDate',
    'price',
    'note',
]) {
    @ApiProperty({ description: 'Supply Id', example: '1' })
    supplyId: string;

    @ApiProperty({ description: 'Equipment Id', example: '1' })
    equipmentId: string;

    static validate = joi.object<AddImportInventoryItemDTO>({
        endOfWarrantyDate: joi
            .date()
            .required()
            .greater(joi.ref('mfDate'))
            .messages({
                ...constant.messageFormat,
                'date.greater': 'phải lớn hơn ngày sản xuất',
            }),
        mfDate: joi
            .date()
            .required()
            .max(today())
            .messages({
                'date.greater': 'phải lớn hơn ngày hiện tại',
                'date.less': 'phải nhỏ hơn ngày hiện tại',
                'date.max': 'phải nhỏ hơn ngày hiện tại',
                ...constant.messageFormat,
            }),
        expiredDate: joi
            .date()
            .required()
            .greater(joi.ref('mfDate'))
            .messages({
                ...constant.messageFormat,
                'date.greater': 'phải lớn hơn ngày sản xuất',
            }),

        quantity: joi.number().min(1).required().messages(constant.messageFormat),
        supplyId: joi.string().allow(null).required().messages(constant.messageFormat),
        equipmentId: joi.string().allow(null).required().messages(constant.messageFormat),
        price: joi.number().min(1).required().messages(constant.messageFormat),
        note: joi.string().failover('').required().messages(constant.messageFormat),
    });
}
