import { Body, Delete, Get, Param, ParseUUIDPipe, Post, Put, Req } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { kebabCase } from 'lodash';
import { EnumListItem } from '../core/common/dtos/paging.dto';
import { NKMethodRouter } from '../core/decorators/NKMethodRouter.decorator';
import { JoiValidatorPipe } from '../core/pipe';
import { Colors } from '../core/util/colors.helper';
import { NKCurdControllerBase } from '../core/common/NKCurdControllerBase';
import { NKKey } from '../core/common/NKKey';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { RouterBaseMethodEnum } from '../core/enum/RouterBaseMethodEnum';
import { UserRoleIndex } from '../user-role/user-role.constant';
import { AddExportInventoryItemDTO } from './dto/add-export-inventory-item.dto';
import { CreateExportInventoryDTO } from './dto/create-export-inventory.dto';
import { UpdateExportInventoryItemDTO } from './dto/update-export-inventory-item.dto';
import { UpdateExportInventoryDTO } from './dto/update-export-inventory.dto';
import { UpdateStatusExportInventoryDTO } from './dto/update-status-export-inventory.dto';
import { ExportInventory, ExportInventoryStatus } from './export-inventory.entity';
import { ExportInventoryService } from './export-inventory.service';

@NKAuthController({
    model: {
        type: ExportInventory,
    },
    baseMethods: [
        RouterBaseMethodEnum.GET_PAGING,
        RouterBaseMethodEnum.GET_ALL,
        RouterBaseMethodEnum.GET_ONE,
        RouterBaseMethodEnum.GET_SELECT_OPTION,
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
            'importRequest',
            'importRequest.importRequestItems',
            'importRequest.importRequestItems.supply',
            'importRequest.importRequestItems.supply.supplyCategory',
            'importRequest.importRequestItems.supply.brand',
            'department',
            'exportInventoryItems',
            'exportInventoryItems.equipment',
            'exportInventoryItems.equipment.equipmentCategory',
            'exportInventoryItems.equipment.brand',
            'exportInventoryItems.supply',
            'exportInventoryItems.supply.supplyCategory',
            'exportInventoryItems.supply.brand',
        ],
    },
})
export class ExportInventoryController extends NKCurdControllerBase<ExportInventory> {
    constructor(private readonly exportInventoryService: ExportInventoryService) {
        const reflector = new Reflector();
        exportInventoryService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, ExportInventoryController);
        super(exportInventoryService);
    }

    @NKMethodRouter(Post('/'))
    async createImportInventory(
        @Req() req: Request,
        @Body(new JoiValidatorPipe(CreateExportInventoryDTO.validate)) body: CreateExportInventoryDTO,
    ) {
        return this.exportInventoryService.createOne(req.user, body);
    }

    @NKMethodRouter(Get('supply/:supplyId'))
    async getAllExportInventoryBySupplyId(@Param('supplyId', new ParseUUIDPipe()) supplyId: string) {
        return this.exportInventoryService.getExportBySupplyId(supplyId);
    }

    @NKMethodRouter(Put('/:id/approve'))
    async approveImportInventory(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Req() req: Request,
        @Body(new JoiValidatorPipe(UpdateStatusExportInventoryDTO.validate))
        body: UpdateStatusExportInventoryDTO,
    ) {
        return this.exportInventoryService.approveExportInventory(req.user, id, body);
    }

    @NKMethodRouter(Put('/:id/cancel'))
    async rejectImportInventory(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Req() req: Request,
        @Body(new JoiValidatorPipe(UpdateStatusExportInventoryDTO.validate))
        body: UpdateStatusExportInventoryDTO,
    ) {
        return this.exportInventoryService.cancelExportInventory(req.user, id, body);
    }

    @NKMethodRouter(Put('/:id'))
    async updateImportInventory(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Req() req: Request,
        @Body(new JoiValidatorPipe(UpdateExportInventoryDTO.validate)) body: UpdateExportInventoryDTO,
    ) {
        return this.exportInventoryService.updateOne(req.user, id, body);
    }

    @NKMethodRouter(Post('/:id/item'))
    async addImportInventoryItem(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Req() req: Request,
        @Body(new JoiValidatorPipe(AddExportInventoryItemDTO.validate)) body: AddExportInventoryItemDTO,
    ) {
        return this.exportInventoryService.addExportInventoryItem(req.user, id, body);
    }

    @NKMethodRouter(Put('/:id/item/:itemId'))
    async updateImportInventoryItem(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Param('itemId', new ParseUUIDPipe())
        itemId: string,
        @Req() req: Request,
        @Body(new JoiValidatorPipe(UpdateExportInventoryItemDTO.validate)) body: UpdateExportInventoryItemDTO,
    ) {
        return this.exportInventoryService.updateExportInventoryItem(req.user, id, itemId, body);
    }

    @NKMethodRouter(Delete('/:id/item/:itemId'))
    async deleteImportInventoryItem(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Param('itemId', new ParseUUIDPipe())
        itemId: string,
        @Req() req: Request,
    ) {
        return this.exportInventoryService.deleteExportInventoryItem(req.user, id, itemId);
    }

    @NKMethodRouter(Get('/department/:departmentId'))
    async getImportInventoryByDepartment(@Param('departmentId', new ParseUUIDPipe()) departmentId: string) {
        return this.exportInventoryService.getAllSupplyByDepartmentId(departmentId);
    }

    @NKMethodRouter(Get('/enum-options/status'))
    getStatusOptions(): EnumListItem[] {
        return [
            {
                id: ExportInventoryStatus.REQUESTING,
                label: 'Yêu cầu',
                name: 'Yêu cầu',
                value: ExportInventoryStatus.REQUESTING,
                color: Colors.YELLOW,
                slug: kebabCase(ExportInventoryStatus.REQUESTING),
            },
            {
                id: ExportInventoryStatus.APPROVED,
                label: 'Đã duyệt',
                name: 'Đã duyệt',
                value: ExportInventoryStatus.APPROVED,
                color: Colors.GREEN,
                slug: kebabCase(ExportInventoryStatus.APPROVED),
            },
            {
                id: ExportInventoryStatus.CANCELLED,
                label: 'Đã hủy',
                name: 'Đã hủy',
                value: ExportInventoryStatus.CANCELLED,
                color: Colors.RED,
                slug: kebabCase(ExportInventoryStatus.CANCELLED),
            },
        ];
    }
}
