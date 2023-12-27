import { Module } from '@nestjs/common';
import { UserTokenService } from './user-token.service';
import { SingleModule } from '../single/single.module';

@Module({
    imports: [SingleModule],
    controllers: [],
    providers: [UserTokenService],
    exports: [UserTokenService],
})
export class UserTokenModule {}
