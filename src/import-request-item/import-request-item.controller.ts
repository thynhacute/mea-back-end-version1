import { Controller } from '@nestjs/common';
import { ImportRequestItemService } from './import-request-item.service';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { ImportRequest } from '../import-request/import-request.entity';
import { RouterBaseMethodEnum } from '../core/enum/RouterBaseMethodEnum';
import { UserRoleIndex } from '../user-role/user-role.constant';
import { NKCurdControllerBase } from '../core/common/NKCurdControllerBase';
import { Reflector } from '@nestjs/core';
import { NKKey } from '../core/common/NKKey';
import { ImportRequestItem } from './import-request-item.entity';

@NKAuthController({
    model: {
        type: ImportRequestItem,
    },
    baseMethods: [
        RouterBaseMethodEnum.GET_PAGING,
        RouterBaseMethodEnum.GET_ALL,
        RouterBaseMethodEnum.GET_ONE,
        RouterBaseMethodEnum.GET_SELECT_OPTION,
    ],
    isAllowDelete: true,
    permission: UserRoleIndex.USER,
    query: {
        isShowDelete: false,
        relations: [],
    },
})
export class ImportRequestItemController extends NKCurdControllerBase<ImportRequestItem> {
    constructor(private readonly importRequestItemService: ImportRequestItemService) {
        const reflector = new Reflector();
        importRequestItemService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, ImportRequestItemController);
        super(importRequestItemService);
    }
}
