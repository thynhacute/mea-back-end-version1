import { Module } from '@nestjs/common';
import { XlsxService } from './xlsx.service';
import { XlsxController } from './xlsx.controller';

@Module({
    controllers: [XlsxController],
    providers: [XlsxService],
    exports: [XlsxService],
})
export class XlsxModule {}
