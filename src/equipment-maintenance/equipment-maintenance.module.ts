import { Module } from '@nestjs/common';
import { EquipmentMaintenanceService } from './equipment-maintenance.service';
import { EquipmentMaintenanceController } from './equipment-maintenance.controller';

@Module({
    controllers: [EquipmentMaintenanceController],
    providers: [EquipmentMaintenanceService],
})
export class EquipmentMaintenanceModule {}
