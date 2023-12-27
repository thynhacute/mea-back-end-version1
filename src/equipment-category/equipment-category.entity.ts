import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToMany } from 'typeorm';

import { NKEntityBase } from '../core/common/NKEntityBase';
import { Equipment } from '../equipment/equipment.entity';
import { NKEntity } from '../core/decorators/NKEntity';
import { NKColumn } from '../core/decorators/NKColumn';
import { Supply } from '../supply/supply.entity';

@NKEntity({
    displayName: 'Danh mục thiết bị',
})
export class EquipmentCategory extends NKEntityBase {
    @ApiProperty({ description: 'Name' })
    @Column({ default: '' })
    @NKColumn({
        displayName: 'Tên',
    })
    name: string;

    @ApiProperty({ description: 'Description', example: 'Medical equipment' })
    @Column({})
    description: string;

    @ApiProperty({ description: 'Code', example: 'ME' })
    @NKColumn({
        displayName: 'Code',
    })
    @Column({ default: '' })
    code: string;

    @OneToMany(() => Equipment, (equipment) => equipment.equipmentCategory, {})
    equipments: Equipment[];

    @OneToMany(() => Supply, (supply) => supply.equipmentCategory)
    supplies: Supply[];
}
