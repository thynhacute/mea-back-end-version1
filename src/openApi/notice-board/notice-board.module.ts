import { Module } from '@nestjs/common';
import { NoticeBoardService } from './notice-board.service';
import { NoticeBoardController } from './notice-board.controller';
import { SenderModule } from '../../sender/sender.module';

@Module({
    imports: [SenderModule],
    controllers: [NoticeBoardController],
    providers: [NoticeBoardService],
})
export class NoticeBoardModule {}
