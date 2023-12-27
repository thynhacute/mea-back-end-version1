import { ApiProperty, PickType } from '@nestjs/swagger';
import joi from 'joi';
import { ImportInventoryItem } from '../../import-inventory-item/import-inventory-item.entity';
import { constant } from 'src/core';
import { today } from 'src/core/util';

export class UpdateImportInventoryItemDTO extends PickType(ImportInventoryItem, [
    'quantity',
    'mfDate',
    'expiredDate',
    'endOfWarrantyDate',
    'price',
    'note',
]) {
    static validate = joi.object<UpdateImportInventoryItemDTO>({
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
        endOfWarrantyDate: joi
            .date()
            .required()
            .greater(joi.ref('mfDate'))
            .messages({
                ...constant.messageFormat,
                'date.greater': 'bảo hành phải lớn hơn ngày sản xuất',
            }),
        quantity: joi
            .number()
            .min(1)
            .required()

            .messages({ ...constant.messageFormat }),
        price: joi.number().min(1).required().messages(constant.messageFormat),
        note: joi.string().required().messages(constant.messageFormat),
    });
}
