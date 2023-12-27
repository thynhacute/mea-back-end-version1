import { User } from './user.entity';
import { OnModuleInit } from '@nestjs/common';
import { NKGlobal } from '../core/common/NKGlobal';
import { genUUID } from '../core/util';
import { hashPassword } from '../core/util/encrypt.helper';
import { UserRoleIndex } from '../user-role/user-role.constant';
import { UserRole } from '../user-role/user-role.entity';

export class UserMigration implements OnModuleInit {
    async onModuleInit() {
        // CREATE SUPER ADMIN
        const superAdminRole = await NKGlobal.entityManager.findOne(UserRole, {
            where: {
                id: genUUID(UserRole.name, UserRoleIndex.ADMIN),
            },
        });

        if (!superAdminRole) {
            const superAdmin = new User();
            superAdmin.id = genUUID(User.name, superAdminRole.id);
            superAdmin.name = 'Super Admin';
            superAdmin.email = 'superadmin@gmail.com';
            superAdmin.username = 'superadmin';
            superAdmin.password = await hashPassword('123456Aa@');
            superAdmin.phone = '';
            superAdmin.role = superAdminRole;
            await NKGlobal.entityManager.save(superAdmin);
        }

        // CREATE INVENTORY MANAGER
        const inventoryManagerRole = await NKGlobal.entityManager.findOne(UserRole, {
            where: {
                id: genUUID(UserRole.name, UserRoleIndex.INVENTORY_MANAGER),
            },
        });

        if (!inventoryManagerRole) {
            const inventoryManager = new User();
            inventoryManager.id = genUUID(User.name, inventoryManagerRole.id);
            inventoryManager.name = 'Inventory Manager';
            inventoryManager.email = 'inventorymanager@gmail.com';
            inventoryManager.username = 'inventorymanager';
            inventoryManager.password = await hashPassword('123456Aa@');
            inventoryManager.phone = '';
            inventoryManager.role = inventoryManagerRole;

            await NKGlobal.entityManager.save(inventoryManager);
        }

        // CREATE MAINTENANCE MANAGER
        const maintenanceManagerRole = await NKGlobal.entityManager.findOne(UserRole, {
            where: {
                id: genUUID(UserRole.name, UserRoleIndex.MAINTENANCE_MANAGER),
            },
        });

        if (!maintenanceManagerRole) {
            const maintenanceManager = new User();
            maintenanceManager.id = genUUID(User.name, maintenanceManagerRole.id);
            maintenanceManager.name = 'Maintenance Manager';
            maintenanceManager.email = 'maintaincemanager@gmail.com';
            maintenanceManager.username = 'maintaincemanager';
            maintenanceManager.password = await hashPassword('123456Aa@');
            maintenanceManager.phone = '';
            maintenanceManager.role = maintenanceManagerRole;

            await NKGlobal.entityManager.save(maintenanceManager);
        }

        // CREATE HEALTHCARE STAFF
        const healthcareStaffRole = await NKGlobal.entityManager.findOne(UserRole, {
            where: {
                id: genUUID(UserRole.name, UserRoleIndex.HEALTHCARE_STAFF),
            },
        });

        if (!healthcareStaffRole) {
            const healthcareStaff = new User();
            healthcareStaff.id = genUUID(User.name, healthcareStaffRole.id);
            healthcareStaff.name = 'Healthcare Staff';
            healthcareStaff.email = 'healthcarestaff@gmail.com';
            healthcareStaff.username = 'healthcarestaff';
            healthcareStaff.password = await hashPassword('123456Aa@');
            healthcareStaff.phone = '';
            healthcareStaff.role = healthcareStaffRole;

            await NKGlobal.entityManager.save(healthcareStaff);
        }

        // CREATE FACILITY MANAGER
        const facilityManagerRole = await NKGlobal.entityManager.findOne(UserRole, {
            where: {
                id: genUUID(UserRole.name, UserRoleIndex.FACILITY_MANAGER),
            },
        });

        if (!facilityManagerRole) {
            const facilityManager = new User();
            facilityManager.id = genUUID(User.name, facilityManagerRole.id);
            facilityManager.name = 'Facility Manager';
            facilityManager.email = 'facilitymanager@gmail.com';
            facilityManager.username = 'facilitymanager';
            facilityManager.password = await hashPassword('123456Aa@');
            facilityManager.phone = '';
            facilityManager.role = facilityManagerRole;

            await NKGlobal.entityManager.save(facilityManager);
        }
    }
}
