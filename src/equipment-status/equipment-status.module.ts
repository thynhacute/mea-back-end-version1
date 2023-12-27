import { Module } from '@nestjs/common';
import { EquipmentStatusService } from './equipment-status.service';
import { EquipmentStatusController } from './equipment-status.controller';

@Module({
    controllers: [EquipmentStatusController],
    providers: [EquipmentStatusService],
    exports: [EquipmentStatusService],
})
export class EquipmentStatusModule {}
