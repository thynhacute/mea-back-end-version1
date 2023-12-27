import { NKServiceBase } from '../core/common/NKServiceBase';
import { NKService } from '../core/decorators/NKService.decorator';
import { Sender, SenderType } from './sender.entity';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import TelegramBot from 'node-telegram-bot-api';
import { NKConfig } from '../core';
import { NKGlobal } from '../core/common/NKGlobal';
import { NKLOGGER_NS } from '../core/logger';
import { SendDto } from './dto/send.dto';
import { SenderCaptureService } from '../sender-capture/sender-capture.service';

@NKService()
export class SenderService extends NKServiceBase<Sender> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
        private readonly senderCaptureService: SenderCaptureService,
    ) {
        super(entityManager.getRepository(Sender));
    }

    async send(dto: SendDto, type: SenderType) {
        const sender = await this.getOneByField('type', type);
        if (!sender) {
            NKGlobal.logger(NKLOGGER_NS.APP_ERROR, `Sender ${type} is not found`);
            return;
        }

        switch (type) {
            case SenderType.EMAIL:
                break;
            case SenderType.SMS:
                break;
            case SenderType.TELEGRAM:
                await this.sendTelegram(sender.to, dto.message);
                await this.senderCaptureService.capture(sender.id, sender.to, dto.message, '', SenderType.TELEGRAM);
                break;

            default:
                break;
        }
    }

    private async sendTelegram(chatId: string, content: string) {
        if (!NKConfig.TELEGRAM_BOT_TOKEN) {
            NKGlobal.logger(NKLOGGER_NS.APP_WARN, 'TELEGRAM_BOT_TOKEN is not defined');
            return;
        }
        const sender = new TelegramBot(NKConfig.TELEGRAM_BOT_TOKEN);
        await sender.sendMessage(chatId, content);
    }
}
