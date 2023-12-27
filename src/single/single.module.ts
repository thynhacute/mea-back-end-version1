import { Module } from '@nestjs/common';
import { SingleService } from './single.service';

@Module({
    controllers: [],
    providers: [SingleService],
    exports: [SingleService],
})
export class SingleModule {}
