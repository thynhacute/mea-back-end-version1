import { ApiProperty } from '@nestjs/swagger';

import { Column, OneToMany } from 'typeorm';
import { NKEntityBase } from '../core/common/NKEntityBase';
import { NKEntity } from '../core/decorators/NKEntity';
import { User } from '../user/user.entity';
import { Equipment } from '../equipment/equipment.entity';
import { ExportInventory } from '../export-inventory/export-inventory.entity';
import { ImportRequest } from '../import-request/import-request.entity';

export enum DepartmentStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

@NKEntity({
    displayName: 'Phòng ban',
})
export class Department extends NKEntityBase {
    @ApiProperty({ description: 'Name', example: 'Pop' })
    @Column({ nullable: false })
    name: string;

    @ApiProperty({ description: 'Description', example: 'Pop music' })
    @Column({ nullable: false })
    description: string;

    @OneToMany(() => User, (user) => user.department, {})
    users: User[];

    @OneToMany(() => Equipment, (equipment) => equipment.department, {})
    equipments: Equipment[];

    @Column({ default: DepartmentStatus.ACTIVE })
    @ApiProperty({
        description: 'status',
        example: DepartmentStatus.ACTIVE,
        enum: DepartmentStatus,
    })
    status: DepartmentStatus;

    @OneToMany(() => ExportInventory, (exportInventory) => exportInventory.department, {})
    exportInventory: ExportInventory[];

    @OneToMany(() => ImportRequest, (importRequest) => importRequest.department, {})
    importRequests: ImportRequest[];
}
