import { Module } from '@nestjs/common';
import { RepairRequestService } from './repair-request.service';
import { RepairRequestController } from './repair-request.controller';
import { EquipmentModule } from '../equipment/equipment.module';
import { EquipmentStatusModule } from '../equipment-status/equipment-status.module';

@Module({
    imports: [EquipmentModule, EquipmentStatusModule],
    controllers: [RepairRequestController],
    providers: [RepairRequestService],
})
export class RepairRequestModule {}
