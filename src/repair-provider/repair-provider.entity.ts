import { ApiProperty } from '@nestjs/swagger';
import { Column } from 'typeorm';
import { NKEntityBase } from '../core/common/NKEntityBase';
import { NKEntity } from '../core/decorators/NKEntity';

export enum RepairProviderStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

@NKEntity({
    displayName: 'Người sửa chữa',
})
export class RepairProvider extends NKEntityBase {
    @ApiProperty({ description: 'Tên', example: 'Tên' })
    @Column({ default: '' })
    name: string;

    @ApiProperty({ description: 'Địa chỉ', example: 'Địa chỉ' })
    @Column({ default: '' })
    address: string;

    @ApiProperty({ description: 'Email', example: 'Email' })
    @Column({ default: '' })
    email: string;

    @ApiProperty({ description: 'Start work date', example: '2021-01-01' })
    @Column({ default: new Date(), type: 'timestamp' })
    startWorkDate: Date;

    @ApiProperty({ description: 'Số điện thoại', example: 'Số điện thoại' })
    @Column({ default: '' })
    phone: string;

    @ApiProperty({ description: 'Bên ngoài', example: true })
    @Column({ default: true })
    isExternal: boolean;

    @ApiProperty({ description: 'Status' })
    @Column({ default: RepairProviderStatus.ACTIVE, length: 64 })
    status: RepairProviderStatus;
}
