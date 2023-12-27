import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, ManyToOne } from 'typeorm';
import { NKEntityBase } from '../core/common/NKEntityBase';
import { User } from '../user/user.entity';
import { Equipment } from '../equipment/equipment.entity';

export enum RepairRequestStatus {
    REQUESTING = 'REQUESTING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED',
}

@Entity()
export class RepairRequest extends NKEntityBase {
    @ApiProperty({ description: 'Description', example: 'Medical equipment' })
    @Column({})
    description: string;

    @ApiProperty({ description: 'images', example: ['hello.png'] })
    @Column({
        type: 'varchar',
        transformer: {
            to: (value: string[]) => value.join('||'),
            from: (value: string) => (value ? value.split('||') : []),
        },
    })
    imageUrls: string[];

    @ApiProperty({
        description: 'Status',
        enum: RepairRequestStatus,
        example: RepairRequestStatus.REQUESTING,
    })
    @Column({
        default: RepairRequestStatus.REQUESTING,
    })
    status: RepairRequestStatus;

    @ApiProperty({ description: 'Equipment' })
    @ManyToOne(() => Equipment, (equipment) => equipment.repairRequests, {})
    equipment: Equipment;

    @ManyToOne(() => User, (user) => user.createRepairRequests, {})
    createdBy: User;

    @ManyToOne(() => User, (user) => user.updateRepairRequests, {})
    updatedBy: User;

    @ApiProperty({ description: 'Note', example: 'Note' })
    @Column({ default: '' })
    note: string;
}
