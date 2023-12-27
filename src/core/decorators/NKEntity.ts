import { SetMetadata, applyDecorators } from '@nestjs/common';
import { Entity } from 'typeorm';
import { NKKey } from '../common/NKKey';

export interface NKEntityOption {
    displayName?: string;
}

export const NKEntity = (options: NKEntityOption) => {
    return applyDecorators(Entity(), SetMetadata(NKKey.REFLECT_ENTITY, options));
};
