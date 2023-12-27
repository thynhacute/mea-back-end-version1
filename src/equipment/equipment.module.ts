import { Module } from '@nestjs/common';
import { EquipmentMaintainScheduleModule } from 'src/equipment-maintain-schedule/equipment-maintain-schedule.module';
import { BrandModule } from '../brand/brand.module';
import { DepartmentModule } from '../department/department.module';
import { EquipmentCategoryModule } from '../equipment-category/equipment-category.module';
import { EquipmentStatusModule } from '../equipment-status/equipment-status.module';
import { EquipmentController } from './equipment.controller';
import { EquipmentService } from './equipment.service';
import { EquipmentCron } from './equipment.cron';

@Module({
    imports: [
        EquipmentCategoryModule,
        DepartmentModule,
        EquipmentStatusModule,
        BrandModule,
        EquipmentMaintainScheduleModule,
    ],
    controllers: [EquipmentController],
    providers: [EquipmentService, EquipmentCron],
    exports: [EquipmentService],
})
export class EquipmentModule {}
