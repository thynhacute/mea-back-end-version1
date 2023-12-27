import { Module } from '@nestjs/common';
import { UserNotificationService } from './user-notification.service';
import { UserNotificationController } from './user-notification.controller';
import { UserModule } from '../user/user.module';
import { FirebaseModule } from 'src/core/provider/firebase/firebase.module';

@Module({
    imports: [UserModule, FirebaseModule],
    controllers: [UserNotificationController],
    providers: [UserNotificationService],
    exports: [UserNotificationService],
})
export class UserNotificationModule {}
