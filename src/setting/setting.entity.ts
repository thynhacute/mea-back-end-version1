import { ApiProperty } from '@nestjs/swagger';

import { Column, Entity } from 'typeorm';
import { NKEntityBase } from '../core/common/NKEntityBase';
import { SETTING_DOMAIN_KEYS } from './setting.constant';

@Entity()
export class Setting extends NKEntityBase {
    @ApiProperty({ description: 'Name' })
    @Column({
        nullable: false,
    })
    name: string;

    @ApiProperty({ description: 'Value', example: 'test value' })
    @Column({
        default: '',
    })
    value: string;

    @Column({
        default: 'string',
    })
    type: string;

    @Column({
        default: SETTING_DOMAIN_KEYS.COMMON,
    })
    domain: string;

    @Column({
        default: '',
    })
    @ApiProperty({ description: 'Description', example: 'test description' })
    description: string;
}
