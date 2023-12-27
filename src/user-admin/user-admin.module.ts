import { Module } from '@nestjs/common';
import { UserAdminService } from './user-admin.service';
import { UserAdminController } from './user-admin.controller';
import { UserModule } from '../user/user.module';
import { UserRoleModule } from '../user-role/user-role.module';
import { AuthModule } from '../auth/auth.module';
import { DepartmentModule } from '../department/department.module';

@Module({
    imports: [UserModule, UserRoleModule, AuthModule, DepartmentModule],
    controllers: [UserAdminController],
    providers: [UserAdminService],
})
export class UserAdminModule {}
