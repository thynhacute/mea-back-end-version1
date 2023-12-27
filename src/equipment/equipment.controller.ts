import { Body, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NKCurdControllerBase } from '../core/common/NKCurdControllerBase';
import { NKKey } from '../core/common/NKKey';
import { PagingFilter, PagingFilterDto } from '../core/common/dtos/paging.dto';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { NKMethodRouter } from '../core/decorators/NKMethodRouter.decorator';
import { RouterBaseMethodEnum } from '../core/enum/RouterBaseMethodEnum';
import { JoiValidatorPipe, QueryJoiValidatorPipe } from '../core/pipe';
import { UserRoleIndex } from '../user-role/user-role.constant';
import { CreateEquipmentDTO } from './dto/create-equipment.dto';
import { UpdateEquipmentDTO } from './dto/update-equipment.dto';
import { Equipment } from './equipment.entity';
import { EquipmentService } from './equipment.service';
import { UpdateEquipmentStatusDTO } from './dto/update-equipment-status.dto';
import { EquipmentStatusService } from '../equipment-status/equipment-status.service';
import { ChangeDepartmentDto } from './dto/change-department.dto';

@NKAuthController({
    model: {
        type: Equipment,
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
        relations: ['department', 'equipmentCategory', 'equipmentStatus', 'brand', 'equipmentMaintainSchedules'],
    },
})
export class EquipmentController extends NKCurdControllerBase<Equipment> {
    constructor(
        private readonly equipmentService: EquipmentService,
        private readonly equipmentStatusService: EquipmentStatusService,
    ) {
        const reflector = new Reflector();
        equipmentService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, EquipmentController);
        super(equipmentService);
    }

    @NKMethodRouter(Get('/search'))
    search(@Query(new QueryJoiValidatorPipe(PagingFilterDto.validate)) query: PagingFilter) {
        return this.equipmentService.getSearchPaging(query);
    }

    @NKMethodRouter(Get('/department/:departmentId'))
    async getAllByDepartmentId(
        @Param('departmentId', new ParseUUIDPipe()) departmentId: string,
        @Query(new QueryJoiValidatorPipe(PagingFilterDto.validate)) query: PagingFilter,
    ) {
        const res = this.equipmentService.getByDepartmentId(departmentId, query);

        return res;
    }

    @NKMethodRouter(Get('/status/:id'))
    async getEquipmentStatus(@Param('id', new ParseUUIDPipe()) id: string) {
        await this.equipmentService.getOneByField('id', id);

        return this.equipmentStatusService.getCurrentStatus(id);
    }

    @NKMethodRouter(Put('/department/:id'))
    async changeDepartment(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: ChangeDepartmentDto) {
        return this.equipmentService.changeDepartment(id, body);
    }

    @NKMethodRouter(Post('/'))
    postOne(@Body(new JoiValidatorPipe(CreateEquipmentDTO.validate)) body: CreateEquipmentDTO) {
        return this.equipmentService.createOne(body);
    }

    @NKMethodRouter(Put('/:id'))
    putOne(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Body(new JoiValidatorPipe(UpdateEquipmentDTO.validate)) body: UpdateEquipmentDTO,
    ) {
        return this.equipmentService.updateOne(id, body);
    }

    @NKMethodRouter(Put('/status/:id'))
    async updateStatus(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: UpdateEquipmentStatusDTO) {
        return this.equipmentService.updateEquipmentStatus(id, body);
    }
}
