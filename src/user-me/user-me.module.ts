import { Module } from '@nestjs/common';
import { UserMeService } from './user-me.service';
import { UserMeController } from './user-me.controller';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';
import { UserTokenModule } from '../user-token/user-token.module';

@Module({
    imports: [UserModule, AuthModule, UserTokenModule],
    controllers: [UserMeController],
    providers: [UserMeService],
})
export class UserMeModule {}
