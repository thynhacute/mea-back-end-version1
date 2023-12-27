import { ApiProperty } from '@nestjs/swagger';
import { Column, OneToMany } from 'typeorm';

import { NKEntityBase } from '../core/common/NKEntityBase';
import { NKColumn } from '../core/decorators/NKColumn';
import { NKEntity } from '../core/decorators/NKEntity';
import { Supply } from '../supply/supply.entity';

@NKEntity({
    displayName: 'Danh mục vật tư',
})
export class SupplyCategory extends NKEntityBase {
    @ApiProperty({ description: 'Name' })
    @Column({ default: '' })
    @NKColumn({
        displayName: 'Tên',
    })
    name: string;

    @ApiProperty({ description: 'Description', example: 'Medical equipment' })
    @Column({})
    description: string;

    @OneToMany(() => Supply, (supply) => supply.supplyCategory, {})
    supplies: Supply[];
}
