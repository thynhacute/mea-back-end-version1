import { ApiProperty, PickType } from '@nestjs/swagger';
import joi from 'joi';
import { ImportRequest } from '../import-request.entity';
import { AddImportRequestItemDTO } from './add-import-request-item.dto';
import { constant } from 'src/core';

export class CreateImportRequestDTO extends PickType(ImportRequest, ['name', 'description', 'expected']) {
    @ApiProperty({ description: 'departmentId' })
    departmentId: string;

    @ApiProperty({
        description: 'importRequestItems',
        type: Array<AddImportRequestItemDTO>,
        example: [AddImportRequestItemDTO.example],
    })
    importRequestItems: AddImportRequestItemDTO[];

    static validate = joi.object<CreateImportRequestDTO>({
        name: joi.string().required().messages(constant.messageFormat),
        description: joi.string().required().messages(constant.messageFormat),
        departmentId: joi.string().allow(null),
        importRequestItems: joi.array().items(AddImportRequestItemDTO.validate),
        expected: joi.string().required().messages(constant.messageFormat),
    });
}
