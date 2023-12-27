import { Column, Entity, ManyToOne } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';
import { NKEntityBase } from '../core/common/NKEntityBase';
import { Equipment } from '../equipment/equipment.entity';
import { ExportInventory } from '../export-inventory/export-inventory.entity';
import { Supply } from '../supply/supply.entity';

@Entity()
export class ExportInventoryItem extends NKEntityBase {
    @ApiProperty({ description: 'Quantity', example: 10 })
    @Column({ default: 0 })
    quantity: number;

    @ApiProperty({ description: 'Note' })
    @Column({ default: '' })
    note: string;

    @ApiProperty({ description: 'Equipment' })
    @ManyToOne(() => Equipment, (equipment) => equipment.exportInventoryItems, {
        nullable: true,
    })
    equipment: Equipment;

    @ApiProperty({ description: 'Supply' })
    @ManyToOne(() => Supply, (supply) => supply.exportInventoryItems, {
        nullable: true,
    })
    supply: Supply;

    @ApiProperty({ description: 'Import Inventory' })
    @ManyToOne(() => ExportInventory, (exportInventory) => exportInventory.exportInventoryItems, {
        nullable: true,
    })
    exportInventory: ExportInventory;
}
