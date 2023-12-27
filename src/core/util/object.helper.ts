import { CompareOperator, PagingFilter, vPagingFilter } from '../interface';
import * as _ from 'lodash';

export const queryGenerator = <T extends Record<string | keyof PagingFilter, any>>(
    input: T,
    comparator: Record<
        keyof Omit<T, keyof PagingFilter>,
        {
            tableName: string;
            operator: CompareOperator;
            compareKey: string;
        }
    >,
) => {
    const newFilterValue: Record<keyof T, any> = {
        ...input,
    };

    input = Object.keys(input).reduce((acc, key) => {
        if (
            input[key] !== undefined &&
            input[key] !== null &&
            input[key] !== '' &&
            !Object.keys(vPagingFilter).includes(key)
        ) {
            if (input[key].length !== 0) {
                acc[key as keyof T] = input[key];
            }
        }
        return acc;
    }, {} as T);

    const query = Object.entries(input).map(([key, value]) => {
        const operator = _.get(comparator, `${key}.operator`, CompareOperator.LIKE);
        const compareKey = _.get(comparator, `${key}.compareKey`, key);
        const tableName = _.get(comparator, `${key}.tableName`, '');
        if (Array.isArray(value)) {
            return `${tableName}.${compareKey} ${operator} (:...${key})`;
        }

        if (operator === CompareOperator.LIKE) {
            newFilterValue[key as keyof T] = `%${value}%`;
        }

        return `${tableName}.${compareKey} ${operator} :${key}`;
    });

    return { queryString: query.join(' AND '), filterValues: newFilterValue };
};
