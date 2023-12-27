import { SetMetadata, applyDecorators } from '@nestjs/common';
import { Column, ColumnOptions, Entity } from 'typeorm';
import { NKKey } from '../common/NKKey';

export interface NKColumnOption {
    displayName?: string;
}

export const NKColumn = (options: NKColumnOption) => {
    return (target: Object | Function, propertyKey?: string | symbol, descriptor?: any) => {
        applyDecorators(SetMetadata(`${NKKey.REFLECT_COLUMN}:${propertyKey as string}`, options))(
            target,
            propertyKey,
            descriptor,
        );
    };
};
