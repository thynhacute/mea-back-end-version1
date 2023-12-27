import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

import { NKEntityBase } from '../core/common/NKEntityBase';
import { EquipmentMaintenance } from '../equipment-maintenance/equipment-maintenance.entity';
import { Equipment } from '../equipment/equipment.entity';

export enum EquipmentStatusType {
    ACTIVE = 'ACTIVE',
    FIXING = 'FIXING',
    BROKEN = 'BROKEN',
    INACTIVE = 'INACTIVE',
    IDLE = 'IDLE',
    DRAFT = 'DRAFT',
}

@Entity()
export class EquipmentStatus extends NKEntityBase {
    @Column({})
    lastStatus: EquipmentStatusType;

    @Column({})
    currentStatus: EquipmentStatusType;

    @Column({})
    note: string;

    @ManyToOne(() => Equipment, (equipment) => equipment.equipmentStatus, {
        cascade: true,
        nullable: true,
    })
    equipment: Equipment;

    @OneToOne(() => EquipmentMaintenance, {
        nullable: true,
    })
    @JoinColumn()
    equipmentMaintenance: EquipmentMaintenance;
}
