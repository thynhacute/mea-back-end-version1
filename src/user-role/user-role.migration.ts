import { OnModuleInit } from '@nestjs/common';
import { NKGlobal } from '../core/common/NKGlobal';
import { genUUID } from '../core/util';
import { UserRoleIndex } from './user-role.constant';
import { UserRole } from './user-role.entity';

export class UserRoleMigration implements OnModuleInit {
    async onModuleInit() {
        // CREATE ADMIN ROLE
        await NKGlobal.entityManager.save(UserRole, {
            id: genUUID(UserRole.name, UserRoleIndex.ADMIN),
            name: 'Admin',
            index: UserRoleIndex.ADMIN,
            isAllowedCreate: true,
            isAllowedDelete: true,
            isAllowedEdit: true,
            isAllowedView: true,
            isApproved: true,
            source: '*',
        });

        // CREATE INVENTORY MANAGER ROLE
        await NKGlobal.entityManager.save(UserRole, {
            id: genUUID(UserRole.name, UserRoleIndex.INVENTORY_MANAGER),
            name: 'Quản lý kho',
            index: UserRoleIndex.INVENTORY_MANAGER,
            isAllowedCreate: true,
            isAllowedDelete: true,
            isAllowedEdit: true,
            isAllowedView: true,
            isApproved: true,
            source: '*',
        });

        // CREATE MAINTENANCE MANAGER ROLE
        await NKGlobal.entityManager.save(UserRole, {
            id: genUUID(UserRole.name, UserRoleIndex.MAINTENANCE_MANAGER),
            name: 'Quản lý bảo trì',
            index: UserRoleIndex.MAINTENANCE_MANAGER,
            isAllowedCreate: true,
            isAllowedDelete: true,
            isAllowedEdit: true,
            isAllowedView: true,
            isApproved: true,
            source: '*',
        });

        // CREATE HEALTHCARE STAFF ROLE
        await NKGlobal.entityManager.save(UserRole, {
            id: genUUID(UserRole.name, UserRoleIndex.HEALTHCARE_STAFF),
            name: 'Nhân viên y tế',
            index: UserRoleIndex.HEALTHCARE_STAFF,
            isAllowedCreate: true,
            isAllowedDelete: true,
            isAllowedEdit: true,
            isAllowedView: true,
            isApproved: true,
            source: '*',
        });

        // CREATE FACILITY MANAGER ROLE
        await NKGlobal.entityManager.save(UserRole, {
            id: genUUID(UserRole.name, UserRoleIndex.FACILITY_MANAGER),
            name: 'Quản lý cơ sở vật chất',
            index: UserRoleIndex.FACILITY_MANAGER,
            isAllowedCreate: true,
            isAllowedDelete: true,
            isAllowedEdit: true,
            isAllowedView: true,
            isApproved: true,
            source: '*',
        });
    }
}
