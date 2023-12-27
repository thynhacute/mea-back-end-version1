import { ApiProperty } from '@nestjs/swagger';
import { Column, JoinTable, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { NKEntityBase } from '../core/common/NKEntityBase';
import { NKEntity } from '../core/decorators/NKEntity';
import { User } from '../user/user.entity';
import { RepairReport } from '../repair-report/repair-report.entity';
import { RepairReplaceItem } from '../repair-replace-item/repair-replace-item.entity';
import { Equipment } from '../equipment/equipment.entity';
import { RepairProvider } from 'src/repair-provider/repair-provider.entity';

export enum RepairReportItemType {
    FIXING = 'FIXING',
    MAINTENANCE = 'MAINTENANCE',
}

export enum RepairReportItemStatus {
    WAITING = 'WAITING',
    FIXING = 'FIXING',
    COMPLETED = 'COMPLETED',
    PAUSED = 'PAUSED',
    CANCELLED = 'CANCELLED',
}

export enum RepairReportItemPaymentStatus {
    NONE = 'NONE',
    REQUESTING = 'REQUESTING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export enum RepairReportItemFeedbackStatus {
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
}

@NKEntity({
    displayName: 'Báo cáo sữa chữa chi tiết',
})
export class RepairReportItem extends NKEntityBase {
    @ApiProperty({ description: 'Mô tả', example: 'Mô tả' })
    @Column({ default: '' })
    description: string;

    @OneToMany(() => RepairReplaceItem, (repairReplaceItem) => repairReplaceItem.repairReportItem, {})
    repairReplaceItems: RepairReplaceItem[];

    @ApiProperty({
        description: 'type',
        example: RepairReportItemType.FIXING,
        enum: RepairReportItemType,
    })
    @Column({ default: RepairReportItemType.FIXING })
    type: RepairReportItemType;

    @Column({
        nullable: true,
    })
    @ApiProperty({ description: 'feedback', example: 'feedback' })
    feedbackStatus: RepairReportItemFeedbackStatus;

    @ApiProperty({
        description: 'status',
        example: RepairReportItemStatus.WAITING,
        enum: RepairReportItemStatus,
    })
    @Column({ default: RepairReportItemStatus.WAITING })
    status: RepairReportItemStatus;

    @ApiProperty({ description: 'equipment', example: 'equipment' })
    @ManyToOne(() => Equipment, (equipment) => equipment.repairReportItems, {})
    equipment: Equipment;

    @ApiProperty({ description: 'images', example: ['hello.png'] })
    @Column({
        type: 'varchar',
        transformer: {
            to: (value: string[]) => value.join('||'),
            from: (value: string) => (value ? value.split('||') : []),
        },
    })
    imageUrls: string[];

    @ManyToOne(() => User, (user) => user.createdRepairReportItems, {})
    createdBy: User;

    @ManyToOne(() => User, (user) => user.updatedRepairReportItems, {})
    updatedBy: User;

    @ManyToOne(() => RepairReport, (repairReport) => repairReport.repairReportItems, {})
    repairReport: RepairReport;

    @ManyToMany(() => RepairProvider)
    @JoinTable()
    repairProviders: RepairProvider[];
}
