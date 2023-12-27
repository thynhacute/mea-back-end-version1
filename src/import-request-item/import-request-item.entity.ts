import { ApiProperty } from '@nestjs/swagger';
import { ImportRequest } from '../import-request/import-request.entity';
import { Column, ManyToOne } from 'typeorm';
import { NKEntityBase } from '../core/common/NKEntityBase';
import { NKEntity } from '../core/decorators/NKEntity';
import { Supply } from '../supply/supply.entity';
import { Equipment } from '../equipment/equipment.entity';

@NKEntity({
    displayName: 'Yêu cầu nhập kho chi tiết',
})
export class ImportRequestItem extends NKEntityBase {
    @ApiProperty({ description: 'Quantity', example: 10 })
    @Column({ default: 0 })
    quantity: number;

    @ApiProperty({ description: 'Supply' })
    @ManyToOne(() => Supply, (supply) => supply.importRequestItems, {
        nullable: true,
    })
    supply: Supply;

    @ApiProperty({ description: 'Approve quantity' })
    @Column({ default: 0 })
    approveQuantity: number;

    @ApiProperty({ description: 'Equipment' })
    @ManyToOne(() => Equipment, (equipment) => equipment.importRequestItems, {
        nullable: true,
    })
    equipment: Equipment;

    @ApiProperty({ description: 'Import Inventory' })
    @ManyToOne(() => ImportRequest, (importRequest) => importRequest.importRequestItems, {
        nullable: true,
    })
    importRequest: ImportRequest;
}
