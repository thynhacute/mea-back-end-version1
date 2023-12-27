import { Column, Entity } from 'typeorm';

import { NKEntityBase } from '../core/common/NKEntityBase';

export enum EquipmentMaintenanceStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

@Entity()
export class EquipmentMaintenance extends NKEntityBase {
    @Column({})
    status: EquipmentMaintenanceStatus;

    @Column({})
    note: string;

    @Column({
        default: new Date(),
    })
    startDate: Date;

    @Column({
        default: new Date(),
    })
    endDate: Date;
}
