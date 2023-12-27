import { ApiProperty } from '@nestjs/swagger';
import { Column, ManyToOne } from 'typeorm';
import { NKEntityBase } from '../core/common/NKEntityBase';
import { NKEntity } from '../core/decorators/NKEntity';
import { Equipment } from '../equipment/equipment.entity';
import { ImportInventory } from '../import-inventory/import-inventory.entity';
import { Supply } from '../supply/supply.entity';

@NKEntity({
    displayName: 'Nhập kho chi tiết',
})
export class ImportInventoryItem extends NKEntityBase {
    @ApiProperty({ description: 'Quantity', example: 10 })
    @Column({ default: 0 })
    quantity: number;

    @ApiProperty({ description: 'Note' })
    @Column({ default: '' })
    note: string;

    @ApiProperty({ description: 'Equipment' })
    @ManyToOne(() => Equipment, (equipment) => equipment.importInventoryItems, {
        nullable: true,
    })
    equipment: Equipment;

    @ApiProperty({ description: 'Price' })
    @Column({ default: 0 })
    price: number;

    @ApiProperty({ description: 'Supply' })
    @ManyToOne(() => Supply, (supply) => supply.importInventoryItems, {
        nullable: true,
    })
    supply: Supply;

    @ApiProperty({ description: 'Import Inventory' })
    @ManyToOne(() => ImportInventory, (importInventory) => importInventory.importInventoryItems, {
        nullable: true,
    })
    importInventory: ImportInventory;

    @ApiProperty({ description: 'Manufacturing Date', example: '2021-01-01' })
    @Column({ default: new Date() })
    mfDate: Date;

    @ApiProperty({ description: 'Expired Date', example: '2021-01-01' })
    @Column({ default: new Date() })
    expiredDate: Date;

    @ApiProperty({ description: 'End of Warranty Date', example: '2021-01-01' })
    @Column({ nullable: true })
    endOfWarrantyDate: Date;
}
