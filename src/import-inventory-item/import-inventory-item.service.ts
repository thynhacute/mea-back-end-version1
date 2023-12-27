import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { NKService } from '../core/decorators/NKService.decorator';
import { ImportInventoryItem } from './import-inventory-item.entity';

@NKService()
export class ImportInventoryItemService extends NKServiceBase<ImportInventoryItem> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) {
        super(entityManager.getRepository(ImportInventoryItem));
    }
}
