import { ApiProperty } from '@nestjs/swagger';
import * as joi from 'joi';
import { constant } from '../../core';
import { PagingFilter, vPagingFilter } from '../../core/interface';

export class ChangePasswordDTO {
    @ApiProperty({ description: 'Current password', example: 'Aa123456' })
    currentPassword: string;

    @ApiProperty({ description: 'New password', example: '12345678' })
    newPassword: string;

    @ApiProperty({ description: 'Confirm new password', example: '12345678' })
    confirmNewPassword: string;
}

export class FilterAdminUsersDTO extends PagingFilter {
    @ApiProperty({ description: 'Name', example: '', nullable: true })
    name: string;

    @ApiProperty({ description: 'Email', example: '', nullable: true })
    email: string;

    @ApiProperty({ description: 'Phone', example: '', nullable: true })
    phone: string;
}
export class UpdateUserDTO {
    @ApiProperty({ description: 'Name', example: 'Duc Dauuu' })
    name: string;

    @ApiProperty({ description: 'Phone', example: '' })
    phone: string;

    @ApiProperty({ description: 'Address', example: '' })
    address: string;
}

export class UpdateUserByAdminDto {
    @ApiProperty({ description: 'Name', example: 'Duc Dauuu' })
    name: string;

    @ApiProperty({ description: 'Phone', example: '' })
    phone: string;

    @ApiProperty({ description: 'Address', example: '' })
    address: string;
}
