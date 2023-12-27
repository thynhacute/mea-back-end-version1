import { Module } from '@nestjs/common';
import { EquipmentMaintainScheduleService } from './equipment-maintain-schedule.service';
import { EquipmentMaintainScheduleController } from './equipment-maintain-schedule.controller';
import { EquipmentMaintainScheduleCron } from './equipment-maintain-schedule.cron';
import { UserNotificationModule } from '../user-notification/user-notification.module';
import { EquipmentModule } from 'src/equipment/equipment.module';

@Module({
    imports: [UserNotificationModule],
    controllers: [EquipmentMaintainScheduleController],
    providers: [EquipmentMaintainScheduleService, EquipmentMaintainScheduleCron],
    exports: [EquipmentMaintainScheduleService],
})
export class EquipmentMaintainScheduleModule {}
