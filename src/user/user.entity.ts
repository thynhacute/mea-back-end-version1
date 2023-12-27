import { ApiProperty } from '@nestjs/swagger';
import { Column, ManyToOne, OneToMany } from 'typeorm';

import { NKEntityBase } from '../core/common/NKEntityBase';
import { NKEntity } from '../core/decorators/NKEntity';
import { Department } from '../department/department.entity';
import { RepairRequest } from '../repair-request/repair-request.entity';
import { UserNotification } from '../user-notification/user-notification.entity';
import { UserRole } from '../user-role/user-role.entity';
import { UserToken } from '../user-token/user-token.entity';
import { ImportInventory } from '../import-inventory/import-inventory.entity';
import { ImportRequest } from '../import-request/import-request.entity';
import { RepairReportItem } from '../repair-report-item/repair-report-item.entity';
import { RepairReport } from '../repair-report/repair-report.entity';
import { ExportInventory } from '../export-inventory/export-inventory.entity';

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export enum UserGender {
    MALE = 'MALE',
    FEMALE = 'FEMALE',
}

@NKEntity({
    displayName: 'Người dùng',
})
export class User extends NKEntityBase {
    @ApiProperty({ description: 'Name' })
    @Column({ default: '', length: 128 })
    name: string;

    @ApiProperty({ description: 'Password', example: '123456Aa@' })
    @Column({ default: null, length: 255 })
    password: string;

    @ApiProperty({ description: 'Email', example: 'superadmin@gmail.com' })
    @Column({ default: null, length: 128 })
    email: string;

    @ApiProperty({ description: 'deviceId', example: 'https://i.imgur.com/4KeKvtH.png' })
    @Column({ default: null, length: 512 })
    deviceId: string;

    @ApiProperty({ description: 'Username', example: 'superadmin' })
    @Column({ default: null, length: 128 })
    username: string;

    @ApiProperty({ description: 'Phone', example: '0123456789' })
    @Column({ default: '', length: 128 })
    phone: string;

    @ApiProperty({ description: 'Birthday', example: '2021-01-01' })
    @Column({ default: new Date(), type: 'timestamp' })
    birthday: Date;

    @ApiProperty({ description: 'Start work date', example: '2021-01-01' })
    @Column({ default: new Date(), type: 'timestamp' })
    startWorkDate: Date;

    @ApiProperty({ description: 'address', example: '123 Nguyen Van Linh' })
    @Column({ default: '', length: 512 })
    address: string;

    @ApiProperty({ description: 'Citizen id', example: '123456789' })
    @Column({ default: '', length: 128 })
    citizenId: string;

    @ApiProperty({
        description: 'gender',
        example: UserGender.MALE,
        enum: UserGender,
    })
    @Column({
        default: UserGender.MALE,
    })
    gender: UserGender;

    @ApiProperty({ description: 'Google id' })
    @Column({ default: null, unique: true, length: 255 })
    googleId: string;

    @ApiProperty({ description: 'Status' })
    @Column({ default: UserStatus.ACTIVE, length: 64 })
    status: UserStatus;

    @ManyToOne(() => UserRole, (userRole) => userRole.users, {
        cascade: true,
    })
    role: UserRole;

    @ManyToOne(() => Department, (department) => department.users, {
        cascade: true,
        nullable: true,
    })
    department: Department;

    @OneToMany(() => UserToken, (user) => user.user, {})
    userTokens: UserToken[];

    @OneToMany(() => UserNotification, (user) => user.user, {})
    userNotifications: UserNotification[];

    @OneToMany(() => UserNotification, (user) => user.sender, {})
    sendNotifications: UserNotification[];

    @OneToMany(() => RepairRequest, (repairRequest) => repairRequest.createdBy, {})
    createRepairRequests: RepairRequest[];

    @OneToMany(() => RepairRequest, (repairRequest) => repairRequest.updatedBy, {})
    updateRepairRequests: RepairRequest[];

    @OneToMany(() => ImportInventory, (importInventory) => importInventory.createdBy, {})
    createdImportInventory: ImportInventory[];

    @OneToMany(() => ImportInventory, (importInventory) => importInventory.updatedBy, {})
    updatedImportInventory: ImportInventory[];

    @OneToMany(() => ImportRequest, (importRequest) => importRequest.createdBy, {})
    createdImportRequests: ImportRequest[];

    @OneToMany(() => ImportRequest, (importRequest) => importRequest.updatedBy, {})
    updatedImportRequests: ImportRequest[];

    @OneToMany(() => RepairReportItem, (repairReportItem) => repairReportItem.createdBy, {})
    createdRepairReportItems: RepairReportItem[];

    @OneToMany(() => RepairReportItem, (repairReportItem) => repairReportItem.updatedBy, {})
    updatedRepairReportItems: RepairReportItem[];

    @OneToMany(() => RepairReport, (repairReport) => repairReport.createdBy, {})
    createdRepairReports: RepairReport[];

    @OneToMany(() => RepairReport, (repairReport) => repairReport.updatedBy, {})
    updatedRepairReports: RepairReport[];

    @OneToMany(() => ExportInventory, (exportInventory) => exportInventory.updatedBy, {})
    updatedExportInventory: ExportInventory[];

    @OneToMany(() => ExportInventory, (exportInventory) => exportInventory.createdBy, {})
    createdExportInventory: ExportInventory[];
}
