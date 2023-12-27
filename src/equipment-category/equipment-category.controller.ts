import { Body, Controller, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { EquipmentCategoryService } from './equipment-category.service';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { EquipmentCategory } from './equipment-category.entity';
import { RouterBaseMethodEnum } from '../core/enum/RouterBaseMethodEnum';
import { UserRoleIndex } from '../user-role/user-role.constant';
import { NKCurdControllerBase } from '../core/common/NKCurdControllerBase';
import { Reflector } from '@nestjs/core';
import { NKKey } from '../core/common/NKKey';
import { NKMethodRouter } from '../core/decorators/NKMethodRouter.decorator';
import { CreateEquipmentCategoryDto } from './dto/create-equipment-category.dto';
import { UpdateEquipmentCategoryDto } from './dto/update-equipment-category.dto';

@NKAuthController({
    model: {
        type: EquipmentCategory,
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
export class EquipmentCategoryController extends NKCurdControllerBase<EquipmentCategory> {
    constructor(private readonly equipmentCategoryService: EquipmentCategoryService) {
        const reflector = new Reflector();
        equipmentCategoryService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, EquipmentCategoryController);
        super(equipmentCategoryService);
    }

    @NKMethodRouter(Post('/'))
    postOne(@Body() body: CreateEquipmentCategoryDto) {
        return this.equipmentCategoryService.createOne(body);
    }

    @NKMethodRouter(Put('/:id'))
    updateOne(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateEquipmentCategoryDto) {
        return this.equipmentCategoryService.updateOne(id, body);
    }
}
