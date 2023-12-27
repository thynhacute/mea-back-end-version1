import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, isBoolean } from 'class-validator';
import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum DocStatusEnum {
    DRAFT = 0,
    SUBMITTED = 5,
    APPROVED = 6,
    CANCELED = 9,
}

export class NKEntityBase {
    @ApiProperty({ description: 'Id' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'Create date' })
    @CreateDateColumn({})
    createdAt: Date;

    @ApiProperty({ description: 'Create date' })
    @UpdateDateColumn({})
    updatedAt: Date;

    @ApiProperty({
        description: 'Is deleted',
        default: false,
    })
    @Column({ default: false })
    @IsBoolean()
    isDeleted: boolean;

    @ApiProperty({
        description: 'Is required update',
        default: false,
    })
    @IsBoolean()
    @Column({ default: false })
    isRequiredUpdate: boolean;

    @Column({
        default: DocStatusEnum.APPROVED,
        enum: DocStatusEnum,
    })
    docStatus: DocStatusEnum;
}
