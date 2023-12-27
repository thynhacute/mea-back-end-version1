import { Module } from '@nestjs/common';
import { ImportInventoryItemService } from './import-inventory-item.service';
import { ImportInventoryItemController } from './import-inventory-item.controller';

@Module({
    controllers: [ImportInventoryItemController],
    providers: [ImportInventoryItemService],
    exports: [ImportInventoryItemService],
})
export class ImportInventoryItemModule {}
