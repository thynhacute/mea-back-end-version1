import { PickType } from '@nestjs/swagger';
import joi from 'joi';
import { constant } from 'src/core';
import { RepairProvider } from '../repair-provider.entity';

export class CreateRepairProviderDTO extends PickType(RepairProvider, [
    'name',
    'address',
    'email',
    'startWorkDate',
    'phone',
    'isExternal',
]) {
    static validate = joi.object<CreateRepairProviderDTO>({
        name: joi.string().required().messages(constant.messageFormat),
        address: joi.string().required().messages(constant.messageFormat),
        email: joi.string().required().messages(constant.messageFormat),
        startWorkDate: joi.date().required().messages(constant.messageFormat),
        phone: joi.string().required().messages(constant.messageFormat),
        isExternal: joi.boolean().required().messages(constant.messageFormat),
    });
}
