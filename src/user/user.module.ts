import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserMigration } from './user.migration';

@Module({
    imports: [],
    controllers: [UserController],
    providers: [UserService, UserMigration],
    exports: [UserService],
})
export class UserModule {}
