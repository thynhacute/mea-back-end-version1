import { Controller } from '@nestjs/common';
import { ImportInventoryItemService } from './import-inventory-item.service';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { UserRoleIndex } from '../user-role/user-role.constant';
import { NKControllerBase } from '../core/common/NKControllerBase';
import { ImportInventoryItem } from './import-inventory-item.entity';
import { Reflector } from '@nestjs/core';
import { NKKey } from '../core/common/NKKey';

@NKAuthController({
    model: {
        type: ImportInventoryItem,
    },
    query: {
        relations: ['equipment', 'supply', 'importInventory'],
    },
    permission: UserRoleIndex.INVENTORY_MANAGER,
})
export class ImportInventoryItemController extends NKControllerBase<ImportInventoryItem> {
    constructor(private readonly importInventoryItemService: ImportInventoryItemService) {
        const reflector = new Reflector();
        importInventoryItemService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, ImportInventoryItemController);

        super(importInventoryItemService);
    }
}
