import { Module } from '@nestjs/common';
import { UserAnonymousService } from './user-anonymous.service';
import { UserAnonymousController } from './user-anonymous.controller';
import { UserTokenModule } from '../user-token/user-token.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
    imports: [UserModule, AuthModule, UserTokenModule],
    controllers: [UserAnonymousController],
    providers: [UserAnonymousService],
})
export class UserAnonymousModule {}
