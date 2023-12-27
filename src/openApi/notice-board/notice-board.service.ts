import { Injectable } from '@nestjs/common';
import { SenderType } from '../../sender/sender.entity';
import { SenderService } from '../../sender/sender.service';
import { NoticeBoardDto } from './dto/noticeBoard.dto';
import { QueueService } from '../../core/queue/queue.service';

@Injectable()
export class NoticeBoardService {
    constructor(private readonly queueService: QueueService) {}

    async sendNotice(dto: NoticeBoardDto) {
        await this.queueService.addSendMessage({
            ...dto,
            receiver: 'telegram-notification-bot',
            type: SenderType.TELEGRAM,
        });
    }
}
