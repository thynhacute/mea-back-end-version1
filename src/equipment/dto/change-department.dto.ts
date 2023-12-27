import { ApiProperty } from '@nestjs/swagger';
import joi from 'joi';
import { constant } from 'src/core';

export class ChangeDepartmentDto {
    @ApiProperty({ description: 'Department Id', example: '123' })
    departmentId: string;

    @ApiProperty({ description: 'Note', example: 'note' })
    note: string;

    static validate = joi.object<ChangeDepartmentDto>({
        departmentId: joi.string().required().messages(constant.messageFormat),
        note: joi.string().allow('').required().messages(constant.messageFormat),
    });
}
