import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne } from 'typeorm';

import { NKEntityBase } from '../core/common/NKEntityBase';
import { EquipmentCategory } from '../equipment-category/equipment-category.entity';
import { EquipmentStatus } from '../equipment-status/equipment-status.entity';
import { NKColumn } from '../core/decorators/NKColumn';
import { Department } from '../department/department.entity';

import { ImportInventoryItem } from '../import-inventory-item/import-inventory-item.entity';
import { RepairRequest } from '../repair-request/repair-request.entity';
import { ImportRequestItem } from '../import-request-item/import-request-item.entity';
import { RepairReport } from '../repair-report/repair-report.entity';
import { ExportInventoryItem } from '../export-inventory-item/export-inventory-item.entity';
import { Brand } from '../brand/brand.entity';
import { RepairReportItem } from '../repair-report-item/repair-report-item.entity';
import { Supply } from '../supply/supply.entity';
import { EquipmentMaintainSchedule } from 'src/equipment-maintain-schedule/equipment-maintain-schedule.entity';

@Entity()
export class Equipment extends NKEntityBase {
    @ApiProperty({ description: 'Name' })
    @Column({ default: '' })
    name: string;

    @ApiProperty({ description: 'Code', example: 'ME' })
    @Column({ default: '' })
    @NKColumn({
        displayName: 'Code',
    })
    code: string;

    @ApiProperty({ description: 'Description', example: 'Medical equipment' })
    @Column({})
    description: string;

    @ApiProperty({ description: 'Manufacturing Date', example: '2021-01-01' })
    @Column({ default: new Date(), type: 'timestamp' })
    mfDate: Date;

    @ApiProperty({ description: 'Import Date', example: '2021-01-01' })
    @Column({ default: new Date(), type: 'timestamp' })
    importDate: Date;

    @ApiProperty({ description: 'End of Warranty Date', example: '2021-01-01' })
    @Column({ default: new Date(), type: 'timestamp' })
    endOfWarrantyDate: Date;

    @ApiProperty({ description: 'images', example: ['hello.png'] })
    @Column({
        type: 'varchar',
        transformer: {
            to: (value: string[]) => value.join('||'),
            from: (value: string) => (value ? value.split('||') : []),
        },
    })
    imageUrls: string[];

    @OneToMany(() => EquipmentMaintainSchedule, (equipmentMaintainSchedule) => equipmentMaintainSchedule.equipment)
    equipmentMaintainSchedules: EquipmentMaintainSchedule[];

    @ManyToOne(() => EquipmentCategory, (equipmentCategory) => equipmentCategory.equipments, {
        cascade: true,
        nullable: true,
    })
    equipmentCategory: EquipmentCategory;

    @ManyToOne(() => Department, (department) => department.equipments, {
        nullable: true,
    })
    department: Department;

    @ManyToOne(() => Brand, (brand) => brand.equipments, {
        nullable: true,
    })
    brand: Brand;

    @OneToMany(() => EquipmentStatus, (equipmentStatus) => equipmentStatus.equipment, {})
    equipmentStatus: EquipmentStatus[];

    @OneToMany(() => ImportInventoryItem, (importInventoryItem) => importInventoryItem.equipment)
    importInventoryItems: ImportInventoryItem[];

    @OneToMany(() => ImportRequestItem, (importRequestItems) => importRequestItems.equipment)
    importRequestItems: ImportRequestItem[];

    @OneToMany(() => ExportInventoryItem, (exportInventoryItem) => exportInventoryItem.equipment)
    exportInventoryItems: ExportInventoryItem[];

    @OneToMany(() => RepairRequest, (repairRequest) => repairRequest.equipment)
    repairRequests: RepairRequest[];

    @OneToMany(() => RepairReportItem, (repairReportItem) => repairReportItem.equipment)
    repairReportItems: RepairReportItem[];
}
