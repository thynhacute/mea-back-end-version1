import { ApiProperty } from '@nestjs/swagger';
import * as joi from 'joi';

export class SelectOptionDto {
    @ApiProperty({ description: '', example: '', nullable: true })
    search: string;

    static validate = joi.object<SelectOptionDto>({
        search: joi.allow(null).failover(null).default(''),
    });
}
