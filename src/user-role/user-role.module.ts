import { Module } from '@nestjs/common';
import { UserRoleService } from './user-role.service';
import { UserRoleController } from './user-role.controller';
import { UserRoleMigration } from './user-role.migration';

@Module({
    controllers: [UserRoleController],
    providers: [UserRoleService, UserRoleMigration],
    exports: [UserRoleService],
})
export class UserRoleModule {}
