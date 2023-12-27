import { InjectEntityManager } from '@nestjs/typeorm';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { NKService } from '../core/decorators/NKService.decorator';
import { EntityManager } from 'typeorm';
import { RepairReplaceItem } from './repair-replace-item.entity';

@NKService()
export class RepairReplaceItemService extends NKServiceBase<RepairReplaceItem> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) {
        super(entityManager.getRepository(RepairReplaceItem));
    }
}
