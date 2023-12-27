import { Module } from '@nestjs/common';
import { RepairReportItemService } from './repair-report-item.service';
import { RepairReportItemController } from './repair-report-item.controller';
import { UserNotificationModule } from 'src/user-notification/user-notification.module';

@Module({
    imports: [UserNotificationModule],
    controllers: [RepairReportItemController],
    providers: [RepairReportItemService],
    exports: [RepairReportItemService],
})
export class RepairReportItemModule {}
