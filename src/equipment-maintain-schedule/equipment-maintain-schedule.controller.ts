import { Reflector } from '@nestjs/core';
import { NKCurdControllerBase } from '../core/common/NKCurdControllerBase';
import { NKKey } from '../core/common/NKKey';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { UserRoleIndex } from '../user-role/user-role.constant';
import { EquipmentMaintainSchedule } from './equipment-maintain-schedule.entity';
import { EquipmentMaintainScheduleService } from './equipment-maintain-schedule.service';
import { NKMethodRouter } from 'src/core/decorators/NKMethodRouter.decorator';
import { Body, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CreateEquipmentMaintainScheduleDTO } from './dto/create-equipment-maintain-schedule';

@NKAuthController({
    model: {
        type: EquipmentMaintainSchedule,
    },
    baseMethods: [],
    isAllowDelete: true,
    permission: UserRoleIndex.USER,

    query: {
        isShowDelete: false,
        relations: ['equipment'],
    },
})
export class EquipmentMaintainScheduleController extends NKCurdControllerBase<EquipmentMaintainSchedule> {
    constructor(private readonly equipmentMaintainService: EquipmentMaintainScheduleService) {
        const reflector = new Reflector();
        equipmentMaintainService.apiOptions = reflector.get(
            NKKey.REFLECT_CONTROLLER,
            EquipmentMaintainScheduleController,
        );
        super(equipmentMaintainService);
    }

    @NKMethodRouter(Post('/'))
    async createScheduleForEquipment(@Body() dto: CreateEquipmentMaintainScheduleDTO) {
        return this.equipmentMaintainService.createOne(dto);
    }

    @NKMethodRouter(Get('/equipment/:equipmentId'))
    async getMaintainScheduleByEquipmentId(
        @Param('equipmentId', new ParseUUIDPipe({}))
        equipmentId: string,
    ) {
        return this.equipmentMaintainService.getMaintainScheduleByEquipmentId(equipmentId);
    }
}
