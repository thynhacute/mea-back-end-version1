import { ApiProperty } from '@nestjs/swagger';
import { NKEntityBase } from '../core/common/NKEntityBase';
import { NKEntity } from '../core/decorators/NKEntity';
import { ImportInventoryItem } from '../import-inventory-item/import-inventory-item.entity';
import { User } from '../user/user.entity';
import { Column, ManyToOne, OneToMany } from 'typeorm';
import { NKColumn } from '../core/decorators/NKColumn';
import { ImportPlan } from '../import-plan/import-plan.entity';
import { getHashCodeCode } from '../core/util';

export enum ImportInventoryStatus {
    DRAFT = 'DRAFT',
    REQUESTING = 'REQUESTING',
    APPROVED = 'APPROVED',
    CANCELLED = 'CANCELLED',
}

@NKEntity({
    displayName: 'Đơn nhập kho',
})
export class ImportInventory extends NKEntityBase {
    @ApiProperty({ description: 'Name' })
    @Column({ default: '' })
    name: string;

    @ApiProperty({ description: 'Note' })
    @Column({ default: '' })
    note: string;

    @ApiProperty({
        description: 'Equipment',
        enum: ImportInventoryStatus,
    })
    @Column({
        default: ImportInventoryStatus.REQUESTING,
    })
    status: ImportInventoryStatus;

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

    @ApiProperty({ description: 'import inventory date' })
    @Column({ default: new Date(), type: 'timestamp' })
    importDate: Date;

    @OneToMany(() => ImportInventoryItem, (importInventoryItem) => importInventoryItem.importInventory, {})
    importInventoryItems: ImportInventoryItem[];

    @ManyToOne(() => User, (user) => user.createdImportInventory, {})
    createdBy: User;

    @ManyToOne(() => User, (user) => user.updatedImportInventory, {})
    updatedBy: User;

    @ManyToOne(() => ImportPlan, (importPlan) => importPlan.importInventories, {})
    importPlan: ImportPlan;
}
