import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { NKGlobal } from '../core/common/NKGlobal';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { NKService } from '../core/decorators/NKService.decorator';
import { SenderCapture } from './sender-capture.entity';

@NKService()
export class SenderCaptureService extends NKServiceBase<SenderCapture> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) {
        super(entityManager.getRepository(SenderCapture));
    }

    async capture(sender: string, to: string, content: string, note: string, type: string) {
        //prevent too long content
        content = content.slice(0, 1000);

        await NKGlobal.entityManager.save(SenderCapture, {
            sender,
            to,
            content,
            note,
            type,
        });
    }
}
