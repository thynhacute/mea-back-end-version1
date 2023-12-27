import { ApiProperty } from '@nestjs/swagger';
import * as joi from 'joi';
import { constant } from '../constant';

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export enum CompareOperator {
    EQUAL = '=',
    NOT_EQUAL = '<>',
    LESS_THAN = '<',
    LESS_THAN_OR_EQUAL = '<=',
    GREATER_THAN = '>',
    GREATER_THAN_OR_EQUAL = '>=',
    IN = 'IN',
    NOT_IN = 'NOT IN',
    LIKE = 'LIKE',
}

export interface PagingResult<T> {
    data: Array<T>;
    count: number;
}

export class PagingFilter {
    @ApiProperty({ description: 'Current Page', example: 0, nullable: true })
    page: number;

    @ApiProperty({ description: 'Page size', example: 12, nullable: true })
    pageSize: number;

    @ApiProperty({ description: 'Order by', example: 'createdAt', nullable: true })
    orderBy: string;

    @ApiProperty({ description: 'Order', example: SortOrder.ASC, nullable: true })
    order: SortOrder;

    @ApiProperty({ description: 'Order', example: false, nullable: true })
    isShowInactive?: boolean = false;

    static validate = joi.object<PagingFilter>({
        page: joi.number().min(0).default(0),
        pageSize: joi.number().min(1).default(12),
    });
}

export const vPagingFilter = {};
