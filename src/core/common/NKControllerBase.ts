import { QueryJoiValidatorPipe } from '../pipe';
import { NKEntityBase } from './NKEntityBase';
import { NKServiceBase } from './NKServiceBase';
import { PagingFilter, PagingFilterDto } from './dtos/paging.dto';
import { Delete, Get, Param, Query, UsePipes } from '@nestjs/common';

export class NKControllerBase<T extends NKEntityBase> {
    constructor(private readonly service: NKServiceBase<T>) {}
}
