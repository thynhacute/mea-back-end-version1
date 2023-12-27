import { Module } from '@nestjs/common';
import { SenderCaptureService } from './sender-capture.service';
import { SenderCaptureController } from './sender-capture.controller';

@Module({
    controllers: [SenderCaptureController],
    providers: [SenderCaptureService],
    exports: [SenderCaptureService],
})
export class SenderCaptureModule {}
