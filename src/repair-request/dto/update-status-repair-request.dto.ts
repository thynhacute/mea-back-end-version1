import { PickType } from '@nestjs/swagger';
import joi from 'joi';
import { RepairRequest } from '../repair-request.entity';
import { constant } from 'src/core';

export class UpdateStatusRepairRequestDTO extends PickType(RepairRequest, ['note']) {
    static validate = joi.object<UpdateStatusRepairRequestDTO>({
        note: joi.string().required().messages(constant.messageFormat),
    });
}
