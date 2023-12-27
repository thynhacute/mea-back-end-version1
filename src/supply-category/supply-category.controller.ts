import { Body, Controller, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { SupplyCategoryService } from './supply-category.service';
import { SupplyCategory } from './supply-category.entity';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { RouterBaseMethodEnum } from '../core/enum/RouterBaseMethodEnum';
import { UserRoleIndex } from '../user-role/user-role.constant';
import { NKCurdControllerBase } from '../core/common/NKCurdControllerBase';
import { Reflector } from '@nestjs/core';
import { NKKey } from '../core/common/NKKey';
import { NKMethodRouter } from '../core/decorators/NKMethodRouter.decorator';
import { CreateSupplyCategoryDto } from './dto/create-supply-category.dto';
import { UpdateEquipmentCategoryDto } from '../equipment-category/dto/update-equipment-category.dto';

@NKAuthController({
    model: {
        type: SupplyCategory,
    },
    baseMethods: [
        RouterBaseMethodEnum.GET_ALL,
        RouterBaseMethodEnum.GET_ONE,
        RouterBaseMethodEnum.GET_PAGING,
        RouterBaseMethodEnum.DELETE_ONE,
        RouterBaseMethodEnum.GET_SELECT_OPTION,
    ],
    isAllowDelete: true,
    permission: UserRoleIndex.USER,
    selectOptionField: 'name',
    query: {
        isShowDelete: false,
    },
})
export class SupplyCategoryController extends NKCurdControllerBase<SupplyCategory> {
    constructor(private readonly supplyCategoryService: SupplyCategoryService) {
        const reflector = new Reflector();
        supplyCategoryService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, SupplyCategoryController);
        super(supplyCategoryService);
    }

    @NKMethodRouter(Post('/'))
    postOne(@Body() body: CreateSupplyCategoryDto) {
        return this.supplyCategoryService.createOne(body);
    }

    @NKMethodRouter(Put('/:id'))
    updateOne(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateEquipmentCategoryDto) {
        return this.supplyCategoryService.updateOne(id, body);
    }
}
