import { Controller } from '@nestjs/common';
import { EquipmentMaintenanceService } from './equipment-maintenance.service';

@Controller('equipment-maintenance')
export class EquipmentMaintenanceController {
    constructor(private readonly equipmentMaintenanceService: EquipmentMaintenanceService) {}
}
