import { Module } from '@nestjs/common';
import { SupplyCategoryService } from './supply-category.service';
import { SupplyCategoryController } from './supply-category.controller';

@Module({
    controllers: [SupplyCategoryController],
    providers: [SupplyCategoryService],
    exports: [SupplyCategoryService],
})
export class SupplyCategoryModule {}
