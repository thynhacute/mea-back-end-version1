import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { NKEntityBase } from '../core/common/NKEntityBase';
import { ApiProperty } from '@nestjs/swagger';
import { NKColumn } from '../core/decorators/NKColumn';
import { getHashCodeCode } from '../core/util';
import { User } from '../user/user.entity';
import { ExportInventoryItem } from '../export-inventory-item/export-inventory-item.entity';
import { Department } from '../department/department.entity';
import { ImportRequest } from '../import-request/import-request.entity';
import { RepairReport } from 'src/repair-report/repair-report.entity';

export enum ExportInventoryStatus {
    REQUESTING = 'REQUESTING',
    APPROVED = 'APPROVED',
    CANCELLED = 'CANCELLED',
}

@Entity()
export class ExportInventory extends NKEntityBase {
    @ApiProperty({ description: 'import inventory date' })
    @Column({ default: new Date(), type: 'timestamp' })
    exportDate: Date;

    @ApiProperty({ description: 'Document Number' })
    @Column({})
    @NKColumn({
        displayName: 'Số Chứng Từ',
    })
    documentNumber: string;

    @ApiProperty({ description: 'Contract Symbol' })
    @Column({})
    @NKColumn({
        displayName: 'Số Hợp Đồng',
    })
    contractSymbol: string;

    @ApiProperty({ description: 'Code' })
    @Column({})
    @NKColumn({
        displayName: 'Mã Kế Hoạch',
    })
    code: string;

    @ApiProperty({
        description: 'Equipment',
        enum: ExportInventoryStatus,
    })
    @Column({
        default: ExportInventoryStatus.REQUESTING,
    })
    status: ExportInventoryStatus;

    @ApiProperty({ description: 'Note' })
    @Column({ default: '' })
    note: string;

    @ManyToOne(() => User, (user) => user.createdExportInventory, {})
    createdBy: User;

    @ManyToOne(() => User, (user) => user.updatedExportInventory, {})
    updatedBy: User;

    @OneToMany(() => ExportInventoryItem, (exportInventoryItem) => exportInventoryItem.exportInventory, {})
    exportInventoryItems: ExportInventoryItem[];

    @ManyToOne(() => Department, (department) => department.exportInventory, {})
    department: Department;

    @ManyToOne(() => ImportRequest, (importRequest) => importRequest.exportInventories, {
        nullable: true,
    })
    importRequest: ImportRequest;
}
