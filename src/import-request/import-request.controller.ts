import { Body, Delete, Get, Param, ParseUUIDPipe, Post, Put, Req } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { kebabCase } from 'lodash';
import { NKCurdControllerBase } from '../core/common/NKCurdControllerBase';
import { NKKey } from '../core/common/NKKey';
import { EnumListItem } from '../core/common/dtos/paging.dto';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { NKMethodRouter } from '../core/decorators/NKMethodRouter.decorator';
import { RouterBaseMethodEnum } from '../core/enum/RouterBaseMethodEnum';
import { JoiValidatorPipe } from '../core/pipe';
import { Colors } from '../core/util/colors.helper';
import { UserRoleIndex } from '../user-role/user-role.constant';
import { AddImportRequestItemDTO } from './dto/add-import-request-item.dto';
import { CreateImportRequestDTO } from './dto/create-import-request.dto';
import { UpdateImportRequestItemDTO } from './dto/update-import-request-item.dto';
import { UpdateImportRequestDTO } from './dto/update-import-request.dto';
import { ImportRequest, ImportRequestExpected, ImportRequestStatus } from './import-request.entity';
import { ImportRequestService } from './import-request.service';
import { UpdateStatusImportRequestDTO } from './dto/update-status-import-request.dto';
import { ChangeApproveQuantityDto } from './dto/change-approve-quantity.dto';

@NKAuthController({
    model: {
        type: ImportRequest,
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
            'importRequestItems',
            'importRequestItems.equipment',
            'importRequestItems.supply',
            'importRequestItems.equipment.equipmentCategory',
            'importRequestItems.equipment.brand',
            'importRequestItems.supply.supplyCategory',
            'importRequestItems.supply.brand',
            'department',
            'exportInventories',
            'exportInventories.exportInventoryItems',
            'exportInventories.exportInventoryItems.equipment',
            'exportInventories.exportInventoryItems.supply',
        ],
    },
})
export class ImportRequestController extends NKCurdControllerBase<ImportRequest> {
    constructor(private readonly importRequestService: ImportRequestService) {
        const reflector = new Reflector();
        importRequestService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, ImportRequestController);
        super(importRequestService);
    }

    @NKMethodRouter(Post('/'))
    async createImportInventory(
        @Req() req: Request,
        @Body(new JoiValidatorPipe(CreateImportRequestDTO.validate)) body: CreateImportRequestDTO,
    ) {
        return this.importRequestService.createOne(req.user, body);
    }

    @NKMethodRouter(Put('/:id/approve'))
    async approveImportInventory(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Req() req: Request,
        @Body(new JoiValidatorPipe(UpdateStatusImportRequestDTO.validate)) body: UpdateStatusImportRequestDTO,
    ) {
        return this.importRequestService.approveImportRequest(req.user, id, body);
    }

    @NKMethodRouter(Put('/:id/submit'))
    async submitImportInventory(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Req() req: Request,
    ) {
        return this.importRequestService.submitImportRequest(req.user, id);
    }

    @NKMethodRouter(Put('/:id/updated'))
    async updatedImportInventory(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Req() req: Request,
        @Body(new JoiValidatorPipe(UpdateStatusImportRequestDTO.validate)) body: UpdateStatusImportRequestDTO,
    ) {
        return this.importRequestService.updatedImportRequest(req.user, id, body);
    }

    @NKMethodRouter(Put('/:id/cancel'))
    async rejectImportInventory(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Req() req: Request,
        @Body(new JoiValidatorPipe(UpdateStatusImportRequestDTO.validate)) body: UpdateStatusImportRequestDTO,
    ) {
        return this.importRequestService.cancelImportRequest(req.user, id, body);
    }

    @NKMethodRouter(Put('/:id'))
    async updateImportInventory(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Req() req: Request,
        @Body(new JoiValidatorPipe(UpdateImportRequestDTO.validate)) body: UpdateImportRequestDTO,
    ) {
        return this.importRequestService.updateOne(req.user, id, body);
    }

    @NKMethodRouter(Post('/:id/item'))
    async addImportInventoryItem(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Req() req: Request,
        @Body(new JoiValidatorPipe(AddImportRequestItemDTO.validate)) body: AddImportRequestItemDTO,
    ) {
        return this.importRequestService.addImportRequestItem(req.user, id, body);
    }

    @NKMethodRouter(Put('/:id/item/:itemId'))
    async updateImportInventoryItem(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Param('itemId', new ParseUUIDPipe())
        itemId: string,
        @Req() req: Request,
        @Body(new JoiValidatorPipe(UpdateImportRequestItemDTO.validate)) body: UpdateImportRequestItemDTO,
    ) {
        return this.importRequestService.updateImportRequestItem(req.user, id, itemId, body);
    }

    @NKMethodRouter(Delete('/:id/item/:itemId'))
    async deleteImportInventoryItem(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Param('itemId', new ParseUUIDPipe())
        itemId: string,
        @Req() req: Request,
    ) {
        return this.importRequestService.deleteImportRequestItem(req.user, id, itemId);
    }

    @NKMethodRouter(Put('approve-quantity/:id'))
    async approveImportRequest(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Req() req: Request,
        @Body(new JoiValidatorPipe(ChangeApproveQuantityDto.validate)) body: ChangeApproveQuantityDto,
    ) {
        return this.importRequestService.changeApproveQuantity(id, body);
    }

    @NKMethodRouter(Put('change-complete/:id'))
    async changeComplete(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Req() req: Request,
    ) {
        return this.importRequestService.changeCompleteStatus(id);
    }

    @NKMethodRouter(Get('/enum-options/status'))
    getStatusOptions(): EnumListItem[] {
        return [
            {
                id: ImportRequestStatus.DRAFT,
                label: 'Nháp',
                name: 'Nháp',
                value: ImportRequestStatus.DRAFT,
                color: Colors.GREY,
                slug: kebabCase(ImportRequestStatus.DRAFT),
            },
            {
                id: ImportRequestStatus.REQUESTING,
                label: 'Đang chờ duyệt',
                name: 'Đang chờ duyệt',
                value: ImportRequestStatus.REQUESTING,
                color: Colors.YELLOW,
                slug: kebabCase(ImportRequestStatus.REQUESTING),
            },
            {
                id: ImportRequestStatus.UPDATED,
                label: 'Đã cập nhật',
                name: 'Đã cập nhật',
                value: ImportRequestStatus.UPDATED,
                color: Colors.BLUE,
                slug: kebabCase(ImportRequestStatus.UPDATED),
            },
            {
                id: ImportRequestStatus.APPROVED,
                label: 'Đã duyệt',
                name: 'Đã duyệt',
                value: ImportRequestStatus.APPROVED,
                color: Colors.GREEN,
                slug: kebabCase(ImportRequestStatus.APPROVED),
            },
            {
                id: ImportRequestStatus.COMPLETED,
                label: 'Đã hoàn thành',
                name: 'Đã hoàn thành',
                value: ImportRequestStatus.COMPLETED,
                color: Colors.ORANGE,
                slug: kebabCase(ImportRequestStatus.COMPLETED),
            },
            {
                id: ImportRequestStatus.CANCELLED,
                label: 'Đã hủy',
                name: 'Đã hủy',
                value: ImportRequestStatus.CANCELLED,
                color: Colors.RED,
                slug: kebabCase(ImportRequestStatus.CANCELLED),
            },
        ];
    }

    @NKMethodRouter(Get('/enum-options/expected'))
    getExpectedOptions(): EnumListItem[] {
        return [
            {
                id: ImportRequestExpected.HOUR_72,
                label: '72 giờ',
                name: '72 giờ',
                value: ImportRequestExpected.HOUR_72,
                color: Colors.GREY,
                slug: kebabCase(ImportRequestExpected.HOUR_72),
            },
            {
                id: ImportRequestExpected.HOUR_36,
                label: '36 giờ',
                name: '36 giờ',
                value: ImportRequestExpected.HOUR_36,
                color: Colors.GREY,
                slug: kebabCase(ImportRequestExpected.HOUR_36),
            },
            {
                id: ImportRequestExpected.HOUR_24,
                label: '24 giờ',
                name: '24 giờ',
                value: ImportRequestExpected.HOUR_24,
                color: Colors.GREY,
                slug: kebabCase(ImportRequestExpected.HOUR_24),
            },
            {
                id: ImportRequestExpected.HOUR_5,
                label: '5 giờ',
                name: '5 giờ',
                value: ImportRequestExpected.HOUR_5,
                color: Colors.GREY,
                slug: kebabCase(ImportRequestExpected.HOUR_5),
            },
            {
                id: ImportRequestExpected.HOUR_3,
                label: '3 giờ',
                name: '3 giờ',
                value: ImportRequestExpected.HOUR_3,
                color: Colors.GREY,
                slug: kebabCase(ImportRequestExpected.HOUR_3),
            },
            {
                id: ImportRequestExpected.HOUR_1,
                label: '1 giờ',
                name: '1 giờ',
                value: ImportRequestExpected.HOUR_1,
                color: Colors.GREY,
                slug: kebabCase(ImportRequestExpected.HOUR_1),
            },
        ];
    }
}
