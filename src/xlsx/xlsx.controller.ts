import { Body, Controller, Post, Res } from '@nestjs/common';
import { XlsxService } from './xlsx.service';
import { ApiTags } from '@nestjs/swagger';
import fs from 'fs';
import { Response } from 'express';
import { CreateXlsxDto } from './dto/create-xlsx.dto';

@ApiTags('xlsx')
@Controller('/api/xlsx')
export class XlsxController {
    constructor(private readonly xlsxService: XlsxService) {}

    @Post('create')
    async create(@Res() res: Response, @Body() body: CreateXlsxDto) {
        const path = await this.xlsxService.createXlsx(body.data);

        return res.send(path);
    }
}
