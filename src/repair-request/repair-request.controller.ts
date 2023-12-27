import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Req } from '@nestjs/common';
import { RepairRequestService } from './repair-request.service';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { RepairRequest, RepairRequestStatus } from './repair-request.entity';
import { RouterBaseMethodEnum } from '../core/enum/RouterBaseMethodEnum';
import { UserRoleIndex } from '../user-role/user-role.constant';
import { NKCurdControllerBase } from '../core/common/NKCurdControllerBase';
import { Reflector } from '@nestjs/core';
import { NKKey } from '../core/common/NKKey';
import { NKRouter } from '../core/decorators/NKRouter.decorator';
import { CreateRepairRequestDto } from './dto/create-repair-request.dto';
import { JoiValidatorPipe } from '../core/pipe';
import { Request } from 'express';
import { UpdateRepairRequestDto } from './dto/update-repair-request.dto';
import { NKMethodRouter } from '../core/decorators/NKMethodRouter.decorator';
import { EnumListItem } from '../core/common/dtos/paging.dto';
import { kebabCase } from 'lodash';
import { Colors } from '../core/util/colors.helper';
import { UpdateStatusRepairRequestDTO } from './dto/update-status-repair-request.dto';

@NKAuthController({
    model: {
        type: RepairRequest,
    },
    baseMethods: [
        RouterBaseMethodEnum.GET_ALL,
        RouterBaseMethodEnum.GET_ONE,
        RouterBaseMethodEnum.GET_PAGING,
        RouterBaseMethodEnum.DELETE_ONE,
    ],
    isAllowDelete: true,
    permission: UserRoleIndex.USER,
    query: {
        isShowDelete: false,
        relations: ['createdBy', 'createdBy.role', 'updatedBy', 'updatedBy.role', 'equipment', 'equipment.department'],
    },
})
export class RepairRequestController extends NKCurdControllerBase<RepairRequest> {
    constructor(private readonly repairRequestService: RepairRequestService) {
        const reflector = new Reflector();
        repairRequestService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, RepairRequestController);
        super(repairRequestService);
    }

    @NKRouter({
        method: Post('/'),
    })
    createOne(
        @Req() req: Request,
        @Body(new JoiValidatorPipe(CreateRepairRequestDto.validate)) body: CreateRepairRequestDto,
    ) {
        return this.repairRequestService.createOne(req.user, body);
    }

    @NKRouter({
        method: Put('/:id'),
    })
    updateOne(
        @Req() req: Request,
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Body(new JoiValidatorPipe(UpdateRepairRequestDto.validate)) body: UpdateRepairRequestDto,
    ) {
        return this.repairRequestService.updateOne(id, req.user, body);
    }

    @NKRouter({
        method: Put('/:id/cancel'),
    })
    cancelOne(
        @Req() req: Request,
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Body(new JoiValidatorPipe(UpdateStatusRepairRequestDTO.validate)) body: UpdateStatusRepairRequestDTO,
    ) {
        return this.repairRequestService.cancelOne(id, req.user, body);
    }

    @NKRouter({
        method: Put('/:id/approve'),
    })
    approveOne(
        @Req() req: Request,
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Body(new JoiValidatorPipe(UpdateStatusRepairRequestDTO.validate)) body: UpdateStatusRepairRequestDTO,
    ) {
        return this.repairRequestService.approveOne(id, req.user, body);
    }

    @NKMethodRouter(Get('/enum-options/status'))
    getStatusOptions(): EnumListItem[] {
        return [
            {
                id: RepairRequestStatus.APPROVED,
                label: 'Đã duyệt',
                name: 'Đã duyệt',
                value: RepairRequestStatus.APPROVED,
                color: Colors.GREEN,
                slug: kebabCase(RepairRequestStatus.APPROVED),
            },
            {
                id: RepairRequestStatus.CANCELLED,
                label: 'Đã hủy',
                name: 'Đã hủy',
                value: RepairRequestStatus.CANCELLED,
                color: Colors.RED,
                slug: kebabCase(RepairRequestStatus.CANCELLED),
            },
            {
                id: RepairRequestStatus.REJECTED,
                label: 'Đã từ chối',
                name: 'Đã từ chối',
                value: RepairRequestStatus.REJECTED,
                color: Colors.RED,
                slug: kebabCase(RepairRequestStatus.REJECTED),
            },
            {
                id: RepairRequestStatus.REQUESTING,
                label: 'Đang chờ duyệt',
                name: 'Đang chờ duyệt',
                value: RepairRequestStatus.REQUESTING,
                color: Colors.YELLOW,
                slug: kebabCase(RepairRequestStatus.REQUESTING),
            },
        ];
    }
}
