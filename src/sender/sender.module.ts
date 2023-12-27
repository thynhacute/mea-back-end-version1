import { Module } from '@nestjs/common';
import { SenderService } from './sender.service';
import { SenderController } from './sender.controller';
import { SenderMigration } from './sender.migration';
import { SenderCaptureModule } from '../sender-capture/sender-capture.module';

@Module({
    imports: [SenderCaptureModule],
    controllers: [SenderController],
    providers: [SenderService, SenderMigration],
    exports: [SenderService],
})
export class SenderModule {
    constructor() {}
}
