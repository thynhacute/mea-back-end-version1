import { InjectEntityManager } from '@nestjs/typeorm';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { NKService } from '../core/decorators/NKService.decorator';
import { ImportPlan } from '../import-plan/import-plan.entity';
import { EntityManager } from 'typeorm';
import { ImportPlanItem } from './import-plan-item.entity';

@NKService()
export class ImportPlanItemService extends NKServiceBase<ImportPlanItem> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) {
        super(entityManager.getRepository(ImportPlanItem));
    }
}
