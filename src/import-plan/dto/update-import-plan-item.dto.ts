import { PickType } from '@nestjs/swagger';
import joi from 'joi';
import { ImportPlanItem } from '../../import-plan-item/import-plan-item.entity';
import { constant } from 'src/core';

export class UpdateImportPlanItemDTO extends PickType(ImportPlanItem, [
    'quantity',
    'price',
    'name',
    'code',
    'machine',
    'category',
    'description',
    'unit',
    'contact',
    'brand',
]) {
    static validate = joi.object<UpdateImportPlanItemDTO>({
        quantity: joi.number().min(1).required().messages(constant.messageFormat),
        price: joi.number().min(1).required().messages(constant.messageFormat),
        name: joi.string().required().messages(constant.messageFormat),
        code: joi.string().required().messages(constant.messageFormat),
        machine: joi.string().required().messages(constant.messageFormat),
        category: joi.string().required().messages(constant.messageFormat),
        description: joi.string().required().messages(constant.messageFormat),
        unit: joi.string().required().messages(constant.messageFormat),
        contact: joi.string().required().messages(constant.messageFormat),
        brand: joi.string().required().messages(constant.messageFormat),
    });
}
