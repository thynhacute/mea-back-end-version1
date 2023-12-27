import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { NKGlobal } from '../core/common/NKGlobal';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { NKService } from '../core/decorators/NKService.decorator';
import { EquipmentMaintainSchedule } from './equipment-maintain-schedule.entity';
import { CreateEquipmentMaintainScheduleDTO } from './dto/create-equipment-maintain-schedule';
import { Equipment } from 'src/equipment/equipment.entity';

@NKService()
export class EquipmentMaintainScheduleService extends NKServiceBase<EquipmentMaintainSchedule> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) {
        super(entityManager.getRepository(EquipmentMaintainSchedule));
        this.apiOptions = {
            query: {
                relations: ['equipment'],
            },
        };
    }

    async createOne(dto: CreateEquipmentMaintainScheduleDTO) {
        const equipment = await NKGlobal.entityManager.findOne(Equipment, {
            id: dto.equipmentId,
        });

        if (!equipment) {
            throw new Error('Không tìm thấy thiết bị');
        }

        return this.entityManager.save(EquipmentMaintainSchedule, {
            maintenanceDate: dto.maintenanceDate,
            isNotified: false,
            note: dto.note,
            equipment: {
                id: dto.equipmentId,
            },
        });
    }

    async getMaintainScheduleByEquipmentId(equipmentId: string) {
        const res = await this.getManyByField('equipment.id', [equipmentId]);

        return res.filter((item) => !item.isDeleted);
    }
}
