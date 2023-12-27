import { Module } from '@nestjs/common';
import { RepairReportService } from './repair-report.service';
import { RepairReportController } from './repair-report.controller';
import { EquipmentModule } from '../equipment/equipment.module';
import { EquipmentStatusModule } from '../equipment-status/equipment-status.module';
import { RepairReportItemModule } from '../repair-report-item/repair-report-item.module';
import { SupplyModule } from '../supply/supply.module';
import { RepairProviderModule } from 'src/repair-provider/repair-provider.module';
import { UserNotificationModule } from 'src/user-notification/user-notification.module';
import { DepartmentModule } from 'src/department/department.module';
import { ImportRequestModule } from 'src/import-request/import-request.module';

@Module({
    imports: [
        EquipmentModule,
        EquipmentStatusModule,
        RepairReportItemModule,
        SupplyModule,
        RepairProviderModule,
        UserNotificationModule,
        DepartmentModule,
        ImportRequestModule,
    ],
    controllers: [RepairReportController],
    providers: [RepairReportService],
    exports: [RepairReportService],
})
export class RepairReportModule {}
