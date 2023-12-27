import { Controller } from '@nestjs/common';
import { ImportPlanItemService } from './import-plan-item.service';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { ImportPlanItem } from './import-plan-item.entity';
import { UserRoleIndex } from '../user-role/user-role.constant';
import { NKControllerBase } from '../core/common/NKControllerBase';
import { Reflector } from '@nestjs/core';
import { NKKey } from '../core/common/NKKey';

@NKAuthController({
    model: {
        type: ImportPlanItem,
    },
    permission: UserRoleIndex.INVENTORY_MANAGER,
})
export class ImportPlanItemController extends NKControllerBase<ImportPlanItem> {
    constructor(private readonly importPlanItemService: ImportPlanItemService) {
        const reflector = new Reflector();
        importPlanItemService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, ImportPlanItemController);

        super(importPlanItemService);
    }
}
