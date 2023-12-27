import { ApiProperty } from '@nestjs/swagger';
import { Column, ManyToOne, OneToMany } from 'typeorm';
import { NKEntityBase } from '../core/common/NKEntityBase';
import { NKEntity } from '../core/decorators/NKEntity';
import { ImportRequestItem } from '../import-request-item/import-request-item.entity';
import { User } from '../user/user.entity';
import { Department } from '../department/department.entity';
import { ExportInventory } from '../export-inventory/export-inventory.entity';

export enum ImportRequestStatus {
    DRAFT = 'DRAFT',
    REQUESTING = 'REQUESTING',
    UPDATED = 'UPDATED',
    APPROVED = 'APPROVED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export enum ImportRequestExpected {
    HOUR_72 = 'HOUR_72',
    HOUR_36 = 'HOUR_36',
    HOUR_24 = 'HOUR_24',
    HOUR_5 = 'HOUR_5',
    HOUR_3 = 'HOUR_3',
    HOUR_1 = 'HOUR_1',
}

@NKEntity({
    displayName: 'Yêu cầu nhập kho',
})
export class ImportRequest extends NKEntityBase {
    @ApiProperty({ description: 'Document title' })
    @Column({ default: '' })
    name: string;

    @ApiProperty({ description: 'Description' })
    @Column({ default: '' })
    description: string;

    @ApiProperty({ description: 'Code' })
    @Column({ default: '' })
    code: string;

    @ApiProperty({ description: 'status' })
    @Column({
        default: ImportRequestStatus.DRAFT,
    })
    status: ImportRequestStatus;

    @ApiProperty({ description: 'Note' })
    @Column({ default: '' })
    note: string;

    @ApiProperty({ description: 'Is done' })
    @Column({ default: false })
    isDone: boolean;

    @ApiProperty({ description: 'Expected' })
    @Column({
        default: ImportRequestExpected.HOUR_72,
    })
    expected: ImportRequestExpected;

    @ManyToOne(() => User, (user) => user.createdImportRequests, {})
    createdBy: User;

    @ManyToOne(() => User, (user) => user.updatedImportRequests, {})
    updatedBy: User;

    @OneToMany(() => ImportRequestItem, (importRequestItem) => importRequestItem.importRequest, {})
    importRequestItems: ImportRequestItem[];

    @ManyToOne(() => Department, (department) => department.importRequests, {})
    department: Department;

    @OneToMany(() => ExportInventory, (exportInventory) => exportInventory.importRequest, {})
    exportInventories: ExportInventory[];
}
