import { ApiProperty } from '@nestjs/swagger';
import { NKEntityBase } from '../core/common/NKEntityBase';
import { NKColumn } from '../core/decorators/NKColumn';
import { Equipment } from '../equipment/equipment.entity';
import { Supply } from '../supply/supply.entity';
import { Column, Entity, OneToMany } from 'typeorm';

export enum BrandStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

@Entity()
export class Brand extends NKEntityBase {
    @ApiProperty({ description: 'Name' })
    @Column({ default: '' })
    name: string;

    @ApiProperty({ description: 'Code', example: 'ME' })
    @Column({ default: '' })
    @NKColumn({
        displayName: 'Code',
    })
    code: string;

    @ApiProperty({ description: 'Description', example: 'Medical supply' })
    @Column({})
    description: string;

    @Column({
        default: BrandStatus.ACTIVE,
    })
    @ApiProperty({
        description: 'Status',
        enum: BrandStatus,
        example: BrandStatus.ACTIVE,
    })
    status: BrandStatus;

    @ApiProperty({ description: 'images', example: '/' })
    @Column({
        default: '',
    })
    imageUrl: string;

    @OneToMany(() => Supply, (supply) => supply.brand)
    supplies: Supply[];

    @OneToMany(() => Equipment, (equipment) => equipment.brand)
    equipments: Equipment[];
}
