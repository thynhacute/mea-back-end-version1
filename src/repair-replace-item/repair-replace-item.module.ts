import { Module } from '@nestjs/common';
import { RepairReplaceItemService } from './repair-replace-item.service';
import { RepairReplaceItemController } from './repair-replace-item.controller';

@Module({
    controllers: [RepairReplaceItemController],
    providers: [RepairReplaceItemService],
})
export class RepairReplaceItemModule {}
