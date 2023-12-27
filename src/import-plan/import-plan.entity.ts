import { ApiProperty } from '@nestjs/swagger';
import { Column, ManyToOne, OneToMany } from 'typeorm';
import { NKEntityBase } from '../core/common/NKEntityBase';
import { NKColumn } from '../core/decorators/NKColumn';
import { NKEntity } from '../core/decorators/NKEntity';
import { ImportPlanItem } from '../import-plan-item/import-plan-item.entity';
import { User } from '../user/user.entity';
import { ImportInventory } from '../import-inventory/import-inventory.entity';
import { getHashCodeCode } from '../core/util';

export enum ImportPlanStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    APPROVED = 'APPROVED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

@NKEntity({
    displayName: 'Kế hoạch nhập kho',
})
export class ImportPlan extends NKEntityBase {
    @ApiProperty({ description: 'Start Import Date' })
    @Column({ default: new Date(), type: 'timestamp' })
    startImportDate: Date;

    @ApiProperty({ description: 'End Import Date' })
    @Column({ default: new Date(), type: 'timestamp' })
    endImportDate: Date;

    @ApiProperty({ description: 'Document Number' })
    @Column({})
    @NKColumn({
        displayName: 'Số Chứng Từ',
    })
    documentNumber: string;

    @Column({ default: '' })
    @ApiProperty({ description: 'name' })
    name: string;

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

    @ApiProperty({ description: 'Note' })
    @Column({
        default: '',
    })
    note: string;

    @ApiProperty({ description: 'status' })
    @Column({
        default: ImportPlanStatus.DRAFT,
    })
    status: ImportPlanStatus;

    @OneToMany(() => ImportPlanItem, (importPlanItem) => importPlanItem.importPlan, {})
    importPlanItems: ImportPlanItem[];

    @ManyToOne(() => User, (user) => user.createdImportInventory, {})
    createdBy: User;

    @ManyToOne(() => User, (user) => user.updatedImportInventory, {})
    updatedBy: User;

    @OneToMany(() => ImportInventory, (importInventory) => importInventory.importPlan, {})
    importInventories: ImportInventory[];
}
