import { Module } from '@nestjs/common';
import { RepairProviderService } from './repair-provider.service';
import { RepairProviderController } from './repair-provider.controller';

@Module({
    controllers: [RepairProviderController],
    providers: [RepairProviderService],
    exports: [RepairProviderService],
})
export class RepairProviderModule {}
