import { Delete, Get, Param, ParseUUIDPipe, Query, UsePipes } from '@nestjs/common';
import { JoiValidatorPipe, QueryJoiValidatorPipe } from '../pipe';
import { NKEntityBase } from './NKEntityBase';
import { NKServiceBase } from './NKServiceBase';
import { PagingFilter, PagingFilterDto } from './dtos/paging.dto';
import { SelectOptionDto } from './dtos/select-options.dto';
import { GenerateReportDto } from './dtos/generate-report.dto';

export class NKCurdControllerBase<T extends NKEntityBase> {
    constructor(private readonly service: NKServiceBase<T>) {}

    @Get('/select-options')
    @UsePipes(new JoiValidatorPipe(SelectOptionDto.validate))
    getSelectOptions(@Query() query: SelectOptionDto) {
        return this.service.getSelectOption(query);
    }

    @Get('/report')
    @UsePipes(new QueryJoiValidatorPipe(GenerateReportDto.validate))
    generateReport(@Query() query: GenerateReportDto) {
        return this.service.getReport(query);
    }

    @Get('/all')
    getAll() {
        return this.service.getAll();
    }

    @Get('/')
    @UsePipes(new QueryJoiValidatorPipe(PagingFilterDto.validate))
    get(@Query() query: PagingFilter) {
        return this.service.getPaging(query);
    }

    @Get('/:id')
    getOne(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.service.getOneByField('id', id);
    }

    @Delete('/:id')
    deleteOne(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.service.deleteOne(id);
    }
}
