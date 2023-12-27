import { ApiProperty } from '@nestjs/swagger';
import * as joi from 'joi';

export class FilterComparator {
    static readonly EQUAL = '=';
    static readonly NOT_EQUAL = '!=';
    static readonly LESS_THAN = '<';
    static readonly LESS_THAN_OR_EQUAL = '<=';
    static readonly GREATER_THAN = '>';
    static readonly GREATER_THAN_OR_EQUAL = '>=';
    static readonly IN = 'IN';
    static readonly NOT_IN = 'NOT IN';
    static readonly LIKE = 'LIKE';
}

export interface EnumListItem {
    id: any;
    label: string;
    color: string;
    slug: string;
    name: string;
    value: any;
}

export class FilterOrderBy {
    static readonly ASC = 'ASC';
    static readonly DESC = 'DESC';
}

export class FilterConnector {
    static readonly AND = 'AND';
    static readonly OR = 'OR';
}

export const pagingFilterDtoSchema = {
    page: joi.number().min(0).default(0),
    pageSize: joi.number().min(1).default(12),
    filters: joi.array().items(joi.string()).default([]),
    orderBy: joi.array().items(joi.string()).default([]),
};

export class PagingFilterDto {
    @ApiProperty({
        description: 'Page',
        example: 0,
    })
    page: number;

    @ApiProperty({ description: 'Page size', example: 12 })
    pageSize: number;

    @ApiProperty({
        description: 'Filters',
        example: [`{{field}} || {{comparator}} || %{{value}}% `],
    })
    filters: Array<string>;

    @ApiProperty({
        description: 'Order by',
        example: [`{{field}} || {{order}}`],
    })
    orderBy: Array<string>;

    static validate = joi.object<PagingFilterDto>(pagingFilterDtoSchema);
}

export class PagingFilter {
    @ApiProperty({ description: 'Page', example: 0 })
    page: number;

    @ApiProperty({ description: 'Page size', example: 12 })
    pageSize: number;

    @ApiProperty({
        description: 'Filters',
        example: [`{{field}} || {{comparator}} || %{{value}}% `],
        default: [],
        required: false,
    })
    filters: Array<{
        field: string;
        comparator: string;
        value: any;
    }>;

    @ApiProperty({
        description: 'Order by',
        example: [`{{field}} || {{order}}`],
        nullable: true,
        default: [],
        required: false,
    })
    orderBy: Array<{
        field: string;
        order: string;
    }>;
}
