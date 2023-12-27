import { Module } from '@nestjs/common';
import { SettingService } from './setting.service';
import { SettingController } from './setting.controller';
import { SettingMigration } from './setting.migration';

@Module({
    controllers: [SettingController],
    providers: [SettingService, SettingMigration],
})
export class SettingModule {}
