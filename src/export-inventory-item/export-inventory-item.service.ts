import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { NKService } from '../core/decorators/NKService.decorator';
import { ExportInventoryItem } from './export-inventory-item.entity';

@NKService()
export class ExportInventoryItemService extends NKServiceBase<ExportInventoryItem> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) {
        super(entityManager.getRepository(ExportInventoryItem));
    }
}
