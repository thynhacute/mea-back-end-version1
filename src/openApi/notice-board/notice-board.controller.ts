import { Body, Controller, HttpStatus, Post, Req } from '@nestjs/common';
import { NoticeBoardService } from './notice-board.service';
import { NKOpenApiController } from '../../core/decorators/NKOpenApiController.decorator';
import { NoticeBoardDto } from './dto/noticeBoard.dto';
import { get } from 'lodash';
import { NKResponseException, nkMessage } from '../../core/exception';
import { Request } from 'express';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@NKOpenApiController({
    apiName: 'notice-board',
})
export class NoticeBoardController {
    constructor(private readonly noticeBoardService: NoticeBoardService) {}

    @Post('/send')
    async sendNotice(@Body() dto: NoticeBoardDto, @Req() req: Request) {
        const origin = get(req, 'headers.origin', '');
        try {
            await this.noticeBoardService.sendNotice({
                ...dto,
                message: JSON.stringify({
                    message: dto.message,
                    createdAt: new Date().toISOString(),
                    origin,
                }),
            });

            return nkMessage.message.ok;
        } catch (error) {
            console.log(error);
            throw new NKResponseException(nkMessage.error.invalidInput, HttpStatus.BAD_REQUEST);
        }
    }
}
