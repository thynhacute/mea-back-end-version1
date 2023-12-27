import { Module } from '@nestjs/common';
import { UserNotificationModule } from 'src/user-notification/user-notification.module';
import { UserModule } from 'src/user/user.module';
import { DepartmentModule } from '../department/department.module';
import { EquipmentModule } from '../equipment/equipment.module';
import { SupplyModule } from '../supply/supply.module';
import { ImportRequestController } from './import-request.controller';
import { ImportRequestCron } from './import-request.cron';
import { ImportRequestService } from './import-request.service';

@Module({
    imports: [DepartmentModule, SupplyModule, EquipmentModule, UserNotificationModule, UserModule],
    controllers: [ImportRequestController],
    providers: [ImportRequestService, ImportRequestCron],
    exports: [ImportRequestService, ImportRequestCron],
})
export class ImportRequestModule {}
