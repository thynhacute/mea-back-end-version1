import { Module } from '@nestjs/common';
import { ImportInventoryService } from './import-inventory.service';
import { ImportInventoryController } from './import-inventory.controller';
import { SupplyModule } from '../supply/supply.module';
import { EquipmentModule } from '../equipment/equipment.module';
import { ImportInventoryItemModule } from '../import-inventory-item/import-inventory-item.module';
import { EquipmentStatusModule } from '../equipment-status/equipment-status.module';
import { XlsxModule } from 'src/xlsx/xlsx.module';
import { EquipmentCategoryModule } from 'src/equipment-category/equipment-category.module';
import { SupplyCategoryModule } from 'src/supply-category/supply-category.module';
import { ImportPlanModule } from 'src/import-plan/import-plan.module';

@Module({
    imports: [
        SupplyModule,
        EquipmentModule,
        ImportInventoryItemModule,
        EquipmentStatusModule,
        XlsxModule,
        SupplyCategoryModule,
        EquipmentCategoryModule,
        ImportPlanModule,
    ],
    controllers: [ImportInventoryController],
    providers: [ImportInventoryService],
})
export class ImportInventoryModule {}
