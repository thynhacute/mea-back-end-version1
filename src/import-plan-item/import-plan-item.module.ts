import { Module } from '@nestjs/common';
import { ImportPlanItemService } from './import-plan-item.service';
import { ImportPlanItemController } from './import-plan-item.controller';

@Module({
    controllers: [ImportPlanItemController],
    providers: [ImportPlanItemService],
    exports: [ImportPlanItemService],
})
export class ImportPlanItemModule {}
