import { Module } from '@nestjs/common';
import { ImportRequestItemService } from './import-request-item.service';
import { ImportRequestItemController } from './import-request-item.controller';

@Module({
    controllers: [ImportRequestItemController],
    providers: [ImportRequestItemService],
})
export class ImportRequestItemModule {}
