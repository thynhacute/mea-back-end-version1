import { Sender, SenderType } from './sender.entity';
import { OnModuleInit } from '@nestjs/common';
import { NKConfig } from '../core';
import { NKGlobal } from '../core/common/NKGlobal';
import { genUUID } from '../core/util';

export class SenderMigration implements OnModuleInit {
    async onModuleInit() {
        // CREATE TELEGRAM SENDER

        await NKGlobal.entityManager.save(Sender, {
            id: genUUID(Sender.name, SenderType.TELEGRAM),
            name: '',
            type: SenderType.TELEGRAM,
            token: NKConfig.TELEGRAM_BOT_TOKEN,
            host: '',
            port: '',
            from: '',
            to: NKConfig.TELEGRAM_BOT_CHAT_ID,
            password: '',
        });
    }
}
