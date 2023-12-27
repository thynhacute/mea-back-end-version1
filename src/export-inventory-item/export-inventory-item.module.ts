import { Module } from '@nestjs/common';
import { ExportInventoryItemService } from './export-inventory-item.service';
import { ExportInventoryItemController } from './export-inventory-item.controller';

@Module({
    controllers: [ExportInventoryItemController],
    providers: [ExportInventoryItemService],
    exports: [ExportInventoryItemService],
})
export class ExportInventoryItemModule {}
