import { PickType } from '@nestjs/swagger';
import joi from 'joi';
import { ImportRequest } from '../import-request.entity';
import { constant } from 'src/core';

export class UpdateStatusImportRequestDTO extends PickType(ImportRequest, ['note']) {
    static validate = joi.object<UpdateStatusImportRequestDTO>({
        note: joi.string().required().messages(constant.messageFormat),
    });
}
