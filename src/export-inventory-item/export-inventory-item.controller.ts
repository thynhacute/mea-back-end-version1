import { Reflector } from '@nestjs/core';
import { NKControllerBase } from '../core/common/NKControllerBase';
import { NKKey } from '../core/common/NKKey';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { UserRoleIndex } from '../user-role/user-role.constant';
import { ExportInventoryItem } from './export-inventory-item.entity';
import { ExportInventoryItemService } from './export-inventory-item.service';

@NKAuthController({
    model: {
        type: ExportInventoryItem,
    },
    query: {
        relations: ['equipment', 'supply'],
    },
    permission: UserRoleIndex.INVENTORY_MANAGER,
})
export class ExportInventoryItemController extends NKControllerBase<ExportInventoryItem> {
    constructor(private readonly exportInventoryItemService: ExportInventoryItemService) {
        const reflector = new Reflector();
        exportInventoryItemService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, ExportInventoryItemController);

        super(exportInventoryItemService);
    }
}
