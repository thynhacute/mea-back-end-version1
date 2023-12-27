import { Module } from '@nestjs/common';
import { BrandModule } from '../brand/brand.module';
import { EquipmentModule } from '../equipment/equipment.module';
import { SupplyCategoryModule } from '../supply-category/supply-category.module';
import { SupplyController } from './supply.controller';
import { SupplyService } from './supply.service';
import { EquipmentCategoryModule } from '../equipment-category/equipment-category.module';
import { SupplyCron } from './supply.cron';

@Module({
    imports: [BrandModule, SupplyCategoryModule, EquipmentModule, EquipmentCategoryModule],
    controllers: [SupplyController],
    providers: [SupplyService, SupplyCron],
    exports: [SupplyService],
})
export class SupplyModule {}
