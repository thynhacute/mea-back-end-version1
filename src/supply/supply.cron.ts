import { Cron } from '@nestjs/schedule';
import { InjectEntityManager } from '@nestjs/typeorm';
import { NKLOGGER_NS, nkLogger } from 'src/core/logger';
import { EntityManager } from 'typeorm';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { NKService } from '../core/decorators/NKService.decorator';
import { QuantityStatus, Supply } from './supply.entity';
import { Injectable, Scope } from '@nestjs/common';
import { NKGlobal } from 'src/core/common/NKGlobal';

@Injectable({ scope: Scope.DEFAULT })
export class SupplyCron {
    constructor() {}

    @Cron('45 * * * * *')
    async handleCron() {
        nkLogger(NKLOGGER_NS.APP_CRON, 'Check supply quantity status');
        await NKGlobal.entityManager
            .createQueryBuilder()
            .update(Supply)
            .set({
                quantityStatus: QuantityStatus.AVAILABLE,
            })
            .where('quantity > 0')
            .execute();
        await NKGlobal.entityManager
            .createQueryBuilder()
            .update(Supply)
            .set({
                quantityStatus: QuantityStatus.NOT_AVAILABLE,
            })
            .where('quantity <= 0')
            .execute();
    }
}
