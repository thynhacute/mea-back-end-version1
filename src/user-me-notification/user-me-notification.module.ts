import { Module } from '@nestjs/common';
import { UserMeNotificationService } from './user-me-notification.service';
import { UserMeNotificationController } from './user-me-notification.controller';
import { UserNotificationModule } from '../user-notification/user-notification.module';

@Module({
    imports: [UserNotificationModule],
    controllers: [UserMeNotificationController],
    providers: [UserMeNotificationService],
})
export class UserMeNotificationModule {}
