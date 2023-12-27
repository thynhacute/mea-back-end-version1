import { ApiProperty } from '@nestjs/swagger';
import { Column, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { NKEntityBase } from '../core/common/NKEntityBase';
import { NKEntity } from '../core/decorators/NKEntity';
import { User } from '../user/user.entity';
import { Equipment } from '../equipment/equipment.entity';
import { RepairReportItem } from '../repair-report-item/repair-report-item.entity';
import { RepairReplaceItem } from '../repair-replace-item/repair-replace-item.entity';

export enum RepairReportStatus {
    REQUESTING = 'REQUESTING',
    FIXING = 'FIXING',
    WAITING_FOR_SUPPLY = 'WAITING_FOR_SUPPLY',
    COMPLETED = 'COMPLETED',
    PAUSED = 'PAUSED',
    CANCELLED = 'CANCELLED',
}

@NKEntity({
    displayName: 'Báo cáo sữa chữa',
})
export class RepairReport extends NKEntityBase {
    @ApiProperty({
        description: 'status',
        example: RepairReportStatus.FIXING,
        enum: RepairReportStatus,
    })
    @Column({ default: RepairReportStatus.FIXING })
    status: RepairReportStatus;

    @ApiProperty({ description: 'Code' })
    @Column({ default: '' })
    code: string;

    @ApiProperty({ description: 'price', example: 100000 })
    @Column({ default: 0 })
    price: number;

    @ApiProperty({ description: 'Mô tả', example: 'Mô tả' })
    @Column({ default: '' })
    description: string;

    @ApiProperty({ description: 'Ngày báo hỏng', example: new Date() })
    @Column({ default: null, nullable: true })
    brokenDate: Date;

    @ApiProperty({ description: 'Ghi chú', example: 'Ghi chú' })
    @Column({ default: '' })
    note: string;

    @ApiProperty({ description: 'start at', example: new Date() })
    @Column({ default: new Date() })
    startAt: Date;

    @ApiProperty({ description: 'end at', example: new Date() })
    @Column({ default: new Date() })
    endAt: Date;

    @ManyToOne(() => User, (user) => user.createdRepairReports, {})
    createdBy: User;

    @ManyToOne(() => User, (user) => user.updateRepairRequests, {})
    updatedBy: User;

    @OneToMany(() => RepairReportItem, (repairReportItem) => repairReportItem.repairReport, {})
    repairReportItems: RepairReportItem[];

    @Column({ default: '' })
    importRequestId: string;
}
