import { Module, OnModuleInit } from '@nestjs/common';

import { InjectEntityManager, TypeOrmModule } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { NKConfig } from './core';
import { NKGlobal } from './core/common/NKGlobal';
import { CronModule } from './core/cron/cron.module';
import { nkLogger } from './core/logger';
import { QueueModule } from './core/queue/queue.module';
import { DepartmentModule } from './department/department.module';
import { databaseConfig } from './module.config';
import { NoticeBoardModule } from './openApi/notice-board/notice-board.module';
import { SenderCaptureModule } from './sender-capture/sender-capture.module';
import { SenderModule } from './sender/sender.module';
import { SettingModule } from './setting/setting.module';
import { SingleModule } from './single/single.module';
import { UploadFileModule } from './upload-file/upload-file.module';
import { UserAdminModule } from './user-admin/user-admin.module';
import { UserAnonymousModule } from './user-anonymous/user-anonymous.module';
import { UserMeModule } from './user-me/user-me.module';
import { UserRoleModule } from './user-role/user-role.module';
import { UserTokenModule } from './user-token/user-token.module';
import { UserModule } from './user/user.module';
import { UserNotificationModule } from './user-notification/user-notification.module';
import { EquipmentModule } from './equipment/equipment.module';
import { EquipmentCategoryModule } from './equipment-category/equipment-category.module';
import { EquipmentStatusModule } from './equipment-status/equipment-status.module';
import { EquipmentMaintenanceModule } from './equipment-maintenance/equipment-maintenance.module';
import { UserMeNotificationModule } from './user-me-notification/user-me-notification.module';
import { RepairRequestModule } from './repair-request/repair-request.module';
import { SupplyModule } from './supply/supply.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ImportInventoryModule } from './import-inventory/import-inventory.module';
import { ImportInventoryItemModule } from './import-inventory-item/import-inventory-item.module';
import { ImportPlanModule } from './import-plan/import-plan.module';
import { ImportPlanItemModule } from './import-plan-item/import-plan-item.module';
import { ImportRequestModule } from './import-request/import-request.module';
import { ImportRequestItemModule } from './import-request-item/import-request-item.module';
import { RepairReportModule } from './repair-report/repair-report.module';
import { RepairReportItemModule } from './repair-report-item/repair-report-item.module';
import { ExportInventoryModule } from './export-inventory/export-inventory.module';
import { ExportInventoryItemModule } from './export-inventory-item/export-inventory-item.module';
import { RepairReplaceItemModule } from './repair-replace-item/repair-replace-item.module';
import { BrandModule } from './brand/brand.module';
import { SupplyCategoryModule } from './supply-category/supply-category.module';
import { XlsxModule } from './xlsx/xlsx.module';
import { ServeStaticModule } from '@nestjs/serve-static';

import { join } from 'path';
import { RepairProviderModule } from './repair-provider/repair-provider.module';
import { AppOpenController } from './app.controller';

@Module({
    imports: [
        TypeOrmModule.forRoot(databaseConfig),
        ScheduleModule.forRoot(),
        QueueModule,
        UserModule,
        AuthModule,
        UserRoleModule,
        UserAdminModule,
        UserMeModule,
        SettingModule,
        SingleModule,
        UserTokenModule,
        CronModule,
        SenderModule,
        NoticeBoardModule,
        SenderCaptureModule,
        UploadFileModule,
        UserAnonymousModule,
        DepartmentModule,
        UserNotificationModule,
        EquipmentModule,
        EquipmentCategoryModule,
        EquipmentStatusModule,
        EquipmentMaintenanceModule,
        UserMeNotificationModule,
        RepairRequestModule,
        SupplyModule,
        ImportInventoryModule,
        ImportInventoryItemModule,
        ImportPlanModule,
        ImportPlanItemModule,
        ImportRequestModule,
        ImportRequestItemModule,
        RepairReportModule,
        RepairReportItemModule,
        ExportInventoryModule,
        ExportInventoryItemModule,
        RepairReplaceItemModule,
        BrandModule,
        SupplyCategoryModule,
        XlsxModule,
        ServeStaticModule.forRoot({
            serveRoot: '/api/static',
            rootPath: join(__dirname, '..', 'cache-file'),
        }),
        RepairProviderModule,
    ],
    controllers: [AppOpenController],
    providers: [AppService],
})
export class AppModule implements OnModuleInit {
    constructor(
        @InjectEntityManager()
        entityManager: EntityManager,
    ) {
        NKGlobal.entityManager = entityManager;
        NKGlobal.logger = nkLogger;
        NKGlobal.isProduction = process.env.NODE_ENV === 'production';
        NKGlobal.configuration = NKConfig;
    }

    async onModuleInit() {}
}
