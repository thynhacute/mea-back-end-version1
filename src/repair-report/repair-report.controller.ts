import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Req } from '@nestjs/common';
import { RepairReportService } from './repair-report.service';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { UserRoleIndex } from '../user-role/user-role.constant';
import { RouterBaseMethodEnum } from '../core/enum/RouterBaseMethodEnum';
import { RepairReport, RepairReportStatus } from './repair-report.entity';
import { NKCurdControllerBase } from '../core/common/NKCurdControllerBase';
import { Reflector } from '@nestjs/core';
import { NKKey } from '../core/common/NKKey';
import { NKMethodRouter } from '../core/decorators/NKMethodRouter.decorator';
import { EnumListItem } from '../core/common/dtos/paging.dto';
import { Colors } from '../core/util/colors.helper';
import { kebabCase } from 'lodash';
import { JoiValidatorPipe } from '../core/pipe';
import { CreateRepairReportDto } from './dto/create-repair-report.dto';
import { UpdateRepairReportDto } from './dto/update-repair-report.dto';
import { Request } from 'express';
import { AddRepairReportItemDto } from './dto/add-repair-report-item.dto';
import { UpdateRepairReportItemDto } from './dto/update-repair-report-item.dto';
import { AddRepairReplaceItemDto } from 'src/repair-replace-item/dto/add-repair-replace-item.dto';
import { UpdateRepairReplaceItemDto } from 'src/repair-replace-item/dto/update-repair-replace-item.dto';

@NKAuthController({
    model: {
        type: RepairReport,
    },
    baseMethods: [
        RouterBaseMethodEnum.GET_ALL,
        RouterBaseMethodEnum.GET_ONE,
        RouterBaseMethodEnum.GET_PAGING,
        RouterBaseMethodEnum.DELETE_ONE,
        RouterBaseMethodEnum.GET_REPORT,
    ],
    isAllowDelete: true,
    permission: UserRoleIndex.USER,
    query: {
        isShowDelete: false,
        relations: [
            'createdBy',
            'createdBy.role',
            'updatedBy',
            'updatedBy.role',
            'repairReportItems',
            'repairReportItems.createdBy',
            'repairReportItems.createdBy.role',
            'repairReportItems.updatedBy',
            'repairReportItems.equipment',
            'repairReportItems.equipment.equipmentCategory',
            'repairReportItems.equipment.department',
            'repairReportItems.equipment.brand',
            'repairReportItems.repairReplaceItems',
            'repairReportItems.repairReplaceItems.supply',
            'repairReportItems.repairProviders',
        ],
    },
})
export class RepairReportController extends NKCurdControllerBase<RepairReport> {
    constructor(private readonly repairReportService: RepairReportService) {
        const reflector = new Reflector();
        repairReportService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, RepairReportController);
        super(repairReportService);
    }

    @NKMethodRouter(Post('/'))
    postOne(
        @Req() req: Request,
        @Body(new JoiValidatorPipe(CreateRepairReportDto.validate)) body: CreateRepairReportDto,
    ) {
        return this.repairReportService.createOne(req.user, body);
    }

    @NKMethodRouter(Put('/:id'))
    putOne(
        @Req() req: Request,
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Body(new JoiValidatorPipe(UpdateRepairReportDto.validate)) body: UpdateRepairReportDto,
    ) {
        return this.repairReportService.updateOne(id, req.user, body);
    }

    @NKMethodRouter(Post('/:id/item'))
    async addRepairReportItem(
        @Req() req: Request,
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Body(new JoiValidatorPipe(AddRepairReportItemDto.validate)) body: AddRepairReportItemDto,
    ) {
        return this.repairReportService.addRepairReportItem(id, req.user, body);
    }

    @NKMethodRouter(Put('/:id/item/:itemId'))
    async updateRepairReportItem(
        @Req() req: Request,
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Param('itemId', new ParseUUIDPipe())
        itemId: string,
        @Body(new JoiValidatorPipe(UpdateRepairReportItemDto.validate)) body: UpdateRepairReportItemDto,
    ) {
        return this.repairReportService.updateRepairReportItem(id, itemId, req.user, body);
    }

    @NKMethodRouter(Delete('/:id/item/:itemId'))
    async deleteRepairReportItem(
        @Req() req: Request,
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Param('itemId', new ParseUUIDPipe())
        itemId: string,
    ) {
        return this.repairReportService.deleteRepairReportItem(id, itemId, req.user);
    }

    @NKMethodRouter(Post('/:id/item/:itemId/repair-replace-item'))
    async addRepairReplaceItem(
        @Req() req: Request,
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Param('itemId', new ParseUUIDPipe())
        itemId: string,
        @Body(new JoiValidatorPipe(AddRepairReplaceItemDto.validate)) body: AddRepairReplaceItemDto,
    ) {
        return this.repairReportService.addReplaceItem(itemId, body);
    }

    @NKMethodRouter(Put('/:id/item/:itemId/repair-replace-item/:replaceItemId'))
    async updateRepairReplaceItem(
        @Req() req: Request,
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Param('itemId', new ParseUUIDPipe())
        itemId: string,
        @Param('replaceItemId', new ParseUUIDPipe())
        replaceItemId: string,
        @Body(new JoiValidatorPipe(UpdateRepairReplaceItemDto.validate)) body: UpdateRepairReplaceItemDto,
    ) {
        return this.repairReportService.updateReplaceItem(itemId, replaceItemId, body);
    }

    @NKMethodRouter(Get('/equipment/:equipmentId'))
    async getRepairReplaceItemByEquipmentId(
        @Param('equipmentId', new ParseUUIDPipe())
        equipmentId: string,
    ) {
        return this.repairReportService.getRepairReportCompleteByEquipmentId(equipmentId);
    }

    @NKMethodRouter(Delete('/:id/item/:itemId/repair-replace-item/:replaceItemId'))
    async deleteRepairReplaceItem(
        @Req() req: Request,
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Param('itemId', new ParseUUIDPipe())
        itemId: string,
        @Param('replaceItemId', new ParseUUIDPipe())
        replaceItemId: string,
    ) {
        return this.repairReportService.deleteReplaceItem(itemId, replaceItemId);
    }

    @NKMethodRouter(Get('/enum-options/status'))
    getStatusOptions(): EnumListItem[] {
        return [
            {
                id: RepairReportStatus.REQUESTING,
                label: 'Đang yêu cầu',
                name: 'Đang yêu cầu',
                value: RepairReportStatus.REQUESTING,
                color: Colors.BLUE,
                slug: kebabCase(RepairReportStatus.REQUESTING),
            },
            {
                id: RepairReportStatus.WAITING_FOR_SUPPLY,
                label: 'Chờ cung cấp',
                name: 'Chờ cung cấp',
                value: RepairReportStatus.WAITING_FOR_SUPPLY,
                color: Colors.PURPLE,
                slug: kebabCase(RepairReportStatus.WAITING_FOR_SUPPLY),
            },
            {
                id: RepairReportStatus.FIXING,
                label: 'Đang sửa chữa',
                name: 'Đang sửa chữa',
                value: RepairReportStatus.FIXING,
                color: Colors.YELLOW,
                slug: kebabCase(RepairReportStatus.FIXING),
            },
            {
                id: RepairReportStatus.PAUSED,
                label: 'Tạm dừng sửa chữa',
                name: 'Tạm dừng sửa chữa',
                value: RepairReportStatus.PAUSED,
                color: Colors.ORANGE,
                slug: kebabCase(RepairReportStatus.PAUSED),
            },
            {
                id: RepairReportStatus.COMPLETED,
                label: 'Hoàn thành',
                name: 'Hoàn thành',
                value: RepairReportStatus.COMPLETED,
                color: Colors.GREEN,
                slug: kebabCase(RepairReportStatus.COMPLETED),
            },
            {
                id: RepairReportStatus.CANCELLED,
                label: 'Hủy sửa chữa',
                name: 'Hủy sửa chữa',
                value: RepairReportStatus.CANCELLED,
                color: Colors.RED,
                slug: kebabCase(RepairReportStatus.CANCELLED),
            },
        ];
    }
}
