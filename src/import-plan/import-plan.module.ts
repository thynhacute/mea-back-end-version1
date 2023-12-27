import { Module } from '@nestjs/common';
import { ImportPlanService } from './import-plan.service';
import { ImportPlanController } from './import-plan.controller';
import { ImportPlanItemModule } from '../import-plan-item/import-plan-item.module';
import { XlsxModule } from '../xlsx/xlsx.module';
import { UserNotificationModule } from 'src/user-notification/user-notification.module';
import { SupplyModule } from 'src/supply/supply.module';

@Module({
    imports: [ImportPlanItemModule, XlsxModule, UserNotificationModule, SupplyModule],
    controllers: [ImportPlanController],
    providers: [ImportPlanService],
    exports: [ImportPlanService],
})
export class ImportPlanModule {}
