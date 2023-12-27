import { Module } from '@nestjs/common';
import { ExportInventoryService } from './export-inventory.service';
import { ExportInventoryController } from './export-inventory.controller';
import { EquipmentModule } from '../equipment/equipment.module';
import { SupplyModule } from '../supply/supply.module';
import { ExportInventoryItemModule } from '../export-inventory-item/export-inventory-item.module';
import { EquipmentStatusModule } from '../equipment-status/equipment-status.module';
import { UserNotificationModule } from 'src/user-notification/user-notification.module';
import { DepartmentModule } from 'src/department/department.module';
import { ImportRequestModule } from 'src/import-request/import-request.module';
import { RepairReportModule } from 'src/repair-report/repair-report.module';

@Module({
    imports: [
        EquipmentModule,
        SupplyModule,
        ExportInventoryItemModule,
        EquipmentStatusModule,
        UserNotificationModule,
        DepartmentModule,
        ImportRequestModule,
        RepairReportModule,
    ],
    controllers: [ExportInventoryController],
    providers: [ExportInventoryService],
})
export class ExportInventoryModule {}
