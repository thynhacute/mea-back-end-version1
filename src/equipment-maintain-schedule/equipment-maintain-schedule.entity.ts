import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne } from 'typeorm';

import { NKEntityBase } from '../core/common/NKEntityBase';
import { Equipment } from '../equipment/equipment.entity';

@Entity()
export class EquipmentMaintainSchedule extends NKEntityBase {
    @ApiProperty({ description: 'Maintenance Date', example: '2021-01-01' })
    @Column({ default: new Date() })
    maintenanceDate: Date;

    @ApiProperty({ description: 'Note', example: 'Note' })
    @Column({ default: '' })
    note: string;

    @ApiProperty({ description: 'Is notified', example: true })
    @Column({ default: false })
    isNotified: boolean;

    @ManyToOne(() => Equipment, (equipment) => equipment.equipmentMaintainSchedules)
    equipment: Equipment;
}
