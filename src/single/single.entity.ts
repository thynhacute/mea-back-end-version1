import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { NKEntityBase } from '../core/common/NKEntityBase';

@Entity()
export class Single extends NKEntityBase {
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
        default: '',
    })
    scope: string;
}
