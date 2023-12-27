import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import * as joi from 'joi';
import { constant } from 'src/core';

export class GenerateReportDto {
    @ApiProperty({
        description: 'Filters',
        example: [`{{field}} || {{comparator}} || %{{value}}% `],
    })
    filters: Array<{
        field: string;
        comparator: string;
        value: any;
    }>;

    @ApiProperty({
        name: 'valuePath',
        description: 'valuePath',
    })
    valuePath: string;

    static validate = joi.object<GenerateReportDto>({
        valuePath: joi.string().required().allow('').messages(constant.messageFormat),
        filters: joi.array().items(joi.string()).default([]),
    });
}
