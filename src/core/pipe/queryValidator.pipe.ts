import { HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectSchema, ValidationError } from 'joi';
import { PagingFilterDto } from '../common/dtos/paging.dto';
import _get from 'lodash/get';
import { isArrayFull, isString } from '../util';
import { CompareOperator } from '../interface';
import { ServerResponse } from 'http';
import { NKResponseException, nkMessage } from '../exception';

@Injectable()
export class QueryJoiValidatorPipe implements PipeTransform {
    constructor(private readonly schema: ObjectSchema) {}

    mapper(dto: PagingFilterDto) {
        const isFilterArray = isArrayFull(dto.filters);
        const isOrderByArray = isArrayFull(dto.orderBy);

        if (!isFilterArray) {
            const filter = _get(dto, 'filters', '') as string;

            if (typeof filter === 'string' && filter.trim()) {
                dto.filters = [filter];
            } else {
                dto.filters = [];
            }
        }

        if (!isOrderByArray) {
            const orderBy = _get(dto, 'orderBy', '') as string;
            if (typeof orderBy === 'string' && orderBy.trim()) {
                dto.orderBy = [orderBy];
            } else {
                dto.orderBy = [];
            }
        }

        return {
            ...dto,
            filters: dto.filters.map((filter) => {
                const filterProps = filter.split('||');
                const field = _get(filterProps, '[0]', '').trim();
                const comparator = _get(filterProps, '[1]', '').trim().toUpperCase();
                let value = _get(filterProps, '[2]', '');

                if (comparator == CompareOperator.LIKE.toString()) {
                    value = `%${value.trim()}%`;
                }

                if (isString(value)) {
                    value = `${value.trim()}`;
                }

                if (!field || !comparator) {
                    throw new NKResponseException(nkMessage.error.invalidInput, HttpStatus.BAD_REQUEST);
                }

                return {
                    field,
                    comparator,
                    value,
                };
            }),
            orderBy: dto.orderBy.map((order) => {
                const orderProps = order.split('||');
                const field = _get(orderProps, '[0]');
                const orderType = _get(orderProps, '[1]');
                return {
                    field,
                    order: orderType,
                };
            }),
        };
    }

    transform(input: any) {
        const { value } = this.schema.validate(input, { convert: true, stripUnknown: true });

        return this.mapper(value);
    }
}
