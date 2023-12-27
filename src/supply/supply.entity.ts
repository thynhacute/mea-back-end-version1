import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

import { NKEntityBase } from '../core/common/NKEntityBase';
import { NKColumn } from '../core/decorators/NKColumn';
import { ImportInventoryItem } from '../import-inventory-item/import-inventory-item.entity';
import { ImportRequestItem } from '../import-request-item/import-request-item.entity';
import { ExportInventoryItem } from '../export-inventory-item/export-inventory-item.entity';
import { RepairReplaceItem } from '../repair-replace-item/repair-replace-item.entity';
import { Brand } from '../brand/brand.entity';
import { SupplyCategory } from '../supply-category/supply-category.entity';
import { Equipment } from '../equipment/equipment.entity';
import { EquipmentCategory } from '../equipment-category/equipment-category.entity';

export enum SupplyStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export enum QuantityStatus {
    AVAILABLE = 'AVAILABLE',
    NOT_AVAILABLE = 'NOT_AVAILABLE',
}

@Entity()
export class Supply extends NKEntityBase {
    @ApiProperty({ description: 'Name' })
    @Column({ default: '' })
    name: string;

    @Column({
        default: SupplyStatus.ACTIVE,
    })
    @ApiProperty({
        description: 'Status',
        enum: SupplyStatus,
        example: SupplyStatus.ACTIVE,
    })
    status: SupplyStatus;

    @ApiProperty({ description: 'Unit', example: 'pcs' })
    @Column({ default: '' })
    unit: string;

    @ApiProperty({ description: 'Code', example: 'ME' })
    @Column({ default: '' })
    @NKColumn({
        displayName: 'Code',
    })
    code: string;

    @ApiProperty({ description: 'Description', example: 'Medical supply' })
    @Column({})
    description: string;

    @ApiProperty({ description: 'Quantity', example: 10 })
    @Column({ default: 0 })
    quantity: number;

    @OneToMany(() => ImportRequestItem, (importRequestItem) => importRequestItem.supply)
    importRequestItems: ImportRequestItem[];

    @ManyToOne(() => Brand, (brand) => brand.supplies, {
        nullable: true,
    })
    brand: Brand;

    @ManyToOne(() => SupplyCategory, (supplyCategory) => supplyCategory.supplies, {
        nullable: true,
    })
    supplyCategory: SupplyCategory;

    @ApiProperty({ description: 'images', example: ['hello.png'] })
    @Column({
        type: 'varchar',
        transformer: {
            to: (value: string[]) => value.join('||'),
            from: (value: string) => (value ? value.split('||') : []),
        },
    })
    imageUrls: string[];

    @ApiProperty({ description: 'Quantity status', example: QuantityStatus.AVAILABLE })
    @Column({ default: QuantityStatus.AVAILABLE })
    quantityStatus: QuantityStatus;

    @OneToMany(() => ImportInventoryItem, (importInventoryItem) => importInventoryItem.supply)
    importInventoryItems: ImportInventoryItem[];

    @OneToMany(() => ExportInventoryItem, (exportInventoryItem) => exportInventoryItem.supply)
    exportInventoryItems: ExportInventoryItem[];

    @OneToMany(() => RepairReplaceItem, (repairReplaceItem) => repairReplaceItem.supply)
    repairReplaceItems: RepairReplaceItem[];

    @ManyToOne(() => EquipmentCategory, (equipmentCategory) => equipmentCategory.supplies, {
        nullable: true,
    })
    equipmentCategory: EquipmentCategory;
}
