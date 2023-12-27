import { ApiProperty, PickType } from '@nestjs/swagger';
import joi from 'joi';
import { ImportRequest } from '../import-request.entity';
import { constant } from 'src/core';

export class UpdateImportRequestDTO extends PickType(ImportRequest, ['name', 'description', 'expected']) {
    @ApiProperty({ description: 'departmentId' })
    departmentId: string;

    static validate = joi.object<UpdateImportRequestDTO>({
        name: joi.string().required().messages(constant.messageFormat),
        description: joi.string().required().messages(constant.messageFormat),
        departmentId: joi.string().allow(null),
        expected: joi.string().required().messages(constant.messageFormat),
    });
}
