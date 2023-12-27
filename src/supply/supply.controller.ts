import { Body, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { kebabCase } from 'lodash';
import { NKCurdControllerBase } from '../core/common/NKCurdControllerBase';
import { NKKey } from '../core/common/NKKey';
import { EnumListItem, PagingFilter, PagingFilterDto } from '../core/common/dtos/paging.dto';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { NKMethodRouter } from '../core/decorators/NKMethodRouter.decorator';
import { RouterBaseMethodEnum } from '../core/enum/RouterBaseMethodEnum';
import { JoiValidatorPipe, QueryJoiValidatorPipe } from '../core/pipe';
import { Colors } from '../core/util/colors.helper';
import { UserRoleIndex } from '../user-role/user-role.constant';
import { CreateSupplyDTO } from './dto/create-supply.dto';
import { UpdateSupplyDTO } from './dto/update-supply.dto';
import { QuantityStatus, Supply, SupplyStatus } from './supply.entity';
import { SupplyService } from './supply.service';
import { EquipmentService } from 'src/equipment/equipment.service';

@NKAuthController({
    model: {
        type: Supply,
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
        relations: ['brand', 'supplyCategory', 'equipmentCategory'],
    },
})
export class SupplyController extends NKCurdControllerBase<Supply> {
    constructor(private readonly supplyService: SupplyService, private readonly equipmentService: EquipmentService) {
        const reflector = new Reflector();
        supplyService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, SupplyController);
        super(supplyService);
    }

    @NKMethodRouter(Get('/search'))
    search(@Query(new QueryJoiValidatorPipe(PagingFilterDto.validate)) query: PagingFilter) {
        return this.supplyService.getSearchPaging(query);
    }

    @NKMethodRouter(Post('/'))
    createOne(@Body(new JoiValidatorPipe(CreateSupplyDTO.validate)) body: CreateSupplyDTO) {
        return this.supplyService.createOne(body);
    }

    @NKMethodRouter(Put('/:id'))
    updateOne(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Body(new JoiValidatorPipe(UpdateSupplyDTO.validate)) body: UpdateSupplyDTO,
    ) {
        return this.supplyService.updateOne(id, body);
    }

    @NKMethodRouter(Get('/code/:code'))
    getOneByCode(@Param('code') code: string) {
        return this.supplyService.getOneByField('code', code);
    }

    @NKMethodRouter(Get('/equipment-category/:equipmentCategoryId'))
    getAllByEquipmentCategoryId(@Param('equipmentCategoryId', new ParseUUIDPipe()) equipmentCategoryId: string) {
        return this.supplyService.getManyByField('equipmentCategory.id', [equipmentCategoryId]);
    }

    @NKMethodRouter(Get('/equipment/:equipmentId'))
    async getAllByEquipmentId(@Param('equipmentId', new ParseUUIDPipe()) equipmentId: string) {
        const equipment = await this.equipmentService.getOneByField('id', equipmentId);
        return this.supplyService.getManyByField('equipmentCategory.id', [equipment.equipmentCategory.id]);
    }

    @NKMethodRouter(Get('/enum-options/status'))
    getStatusOptions(): EnumListItem[] {
        return [
            {
                id: SupplyStatus.ACTIVE,
                label: 'Hoạt động',
                name: 'Hoạt động',
                value: SupplyStatus.ACTIVE,
                color: Colors.GREEN,
                slug: kebabCase(SupplyStatus.ACTIVE),
            },
            {
                id: SupplyStatus.INACTIVE,
                label: 'Không hoạt động',
                name: 'Không hoạt động',
                value: SupplyStatus.INACTIVE,
                color: Colors.RED,
                slug: kebabCase(SupplyStatus.INACTIVE),
            },
        ];
    }

    @NKMethodRouter(Get('/enum-options/quantity-status'))
    getQuantityStatusOptions(): EnumListItem[] {
        return [
            {
                id: QuantityStatus.AVAILABLE,
                label: 'Còn hàng',
                name: 'Còn hàng',
                value: QuantityStatus.AVAILABLE,
                color: Colors.GREEN,
                slug: kebabCase(QuantityStatus.AVAILABLE),
            },
            {
                id: QuantityStatus.NOT_AVAILABLE,
                label: 'Hết hàng',
                name: 'Hết hàng',
                value: QuantityStatus.NOT_AVAILABLE,
                color: Colors.RED,
                slug: kebabCase(QuantityStatus.NOT_AVAILABLE),
            },
        ];
    }
}
