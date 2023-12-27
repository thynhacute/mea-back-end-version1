import { ApiProperty } from '@nestjs/swagger';
import { Column, ManyToOne } from 'typeorm';
import { NKEntityBase } from '../core/common/NKEntityBase';
import { NKEntity } from '../core/decorators/NKEntity';
import { Equipment } from '../equipment/equipment.entity';
import { ImportInventory } from '../import-inventory/import-inventory.entity';
import { Supply } from '../supply/supply.entity';
import { ImportPlan } from '../import-plan/import-plan.entity';
import { NKColumn } from '../core/decorators/NKColumn';

@NKEntity({
    displayName: 'Kế hoạch nhập kho chi tiết',
})
export class ImportPlanItem extends NKEntityBase {
    @ApiProperty({ description: 'Name' })
    @Column({ default: '' })
    name: string;

    @ApiProperty({ description: 'Code', example: 'ME' })
    @Column({ default: '' })
    @NKColumn({
        displayName: 'Code',
    })
    code: string;

    @ApiProperty({ description: 'Machine', example: 'ME' })
    @Column({ default: '' })
    @NKColumn({
        displayName: 'Máy Móc',
    })
    machine: string;

    @ApiProperty({ description: 'Machine', example: 'ME' })
    @Column({ default: '' })
    @NKColumn({
        displayName: 'Máy Móc',
    })
    category: string;

    @ApiProperty({ description: 'Brand', example: 'ME' })
    @Column({ default: '' })
    brand: string;

    @ApiProperty({ description: 'Equipment' })
    @Column({ default: '' })
    description: string;

    @ApiProperty({ description: 'Quantity', example: 10 })
    @Column({ default: 0 })
    quantity: number;

    @ApiProperty({ description: 'Unit', example: 'unit' })
    @Column({ default: '' })
    unit: string;

    @ApiProperty({ description: 'Price' })
    @Column({ default: 0 })
    price: number;

    @ApiProperty({ description: 'Contact' })
    @Column({ default: '' })
    contact: string;

    @ApiProperty({ description: 'Import Inventory' })
    @ManyToOne(() => ImportPlan, (importPlan) => importPlan.importPlanItems, {
        nullable: true,
    })
    importPlan: ImportPlan;
}
