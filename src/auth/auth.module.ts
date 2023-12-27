import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';

import { UserTokenModule } from '../user-token/user-token.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategy/google.strategy';

@Module({
    imports: [UserModule, UserTokenModule],
    controllers: [AuthController],
    providers: [AuthService, GoogleStrategy],
    exports: [AuthService],
})
export class AuthModule {}
