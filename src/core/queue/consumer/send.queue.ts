import { Process, Processor } from '@nestjs/bull';

import { Job } from 'bull';
import { SendDto } from '../../../sender/dto/send.dto';
import { SenderService } from '../../../sender/sender.service';
import { QUEUE_NAME } from '../queue.constant';

@Processor(QUEUE_NAME.SEND)
export class SendQueueProcessor {
    constructor(private readonly senderService: SenderService) {}

    @Process()
    async processQueue(job: Job<SendDto>) {
        await this.senderService.send(job.data, job.data.type);
    }
}
