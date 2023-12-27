import { PickType } from '@nestjs/swagger';
import joi from 'joi';
import { constant } from 'src/core';
import { ImportRequestItem } from 'src/import-request-item/import-request-item.entity';

export class ChangeApproveQuantityDto extends PickType(ImportRequestItem, ['approveQuantity']) {
    static validate = joi.object<ChangeApproveQuantityDto>({
        approveQuantity: joi.number().required().messages(constant.messageFormat),
    });
}
