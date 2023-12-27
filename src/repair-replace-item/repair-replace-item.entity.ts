import { ApiProperty } from '@nestjs/swagger';
import { Supply } from '../supply/supply.entity';
import { Column, ManyToOne } from 'typeorm';
import { NKEntityBase } from '../core/common/NKEntityBase';
import { NKEntity } from '../core/decorators/NKEntity';
import { RepairReport } from '../repair-report/repair-report.entity';
import { RepairReportItem } from '../repair-report-item/repair-report-item.entity';

@NKEntity({
    displayName: 'Thiết bị thay thế',
})
export class RepairReplaceItem extends NKEntityBase {
    @ApiProperty({ description: 'Quantity', example: 10 })
    @Column({ default: 0 })
    quantity: number;

    @ManyToOne(() => Supply, (supply) => supply.repairReplaceItems, {
        nullable: true,
    })
    supply: Supply;

    @ManyToOne(() => RepairReportItem, (repairReportItem) => repairReportItem.repairReplaceItems, {
        nullable: true,
    })
    repairReportItem: RepairReportItem;
}
