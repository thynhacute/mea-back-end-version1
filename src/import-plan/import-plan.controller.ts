import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Req, Res } from '@nestjs/common';
import { ImportPlanService } from './import-plan.service';
import { EnumListItem } from '../core/common/dtos/paging.dto';
import { ImportPlan, ImportPlanStatus } from './import-plan.entity';
import { kebabCase } from 'lodash';
import { Colors } from '../core/util/colors.helper';
import { NKMethodRouter } from '../core/decorators/NKMethodRouter.decorator';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { RouterBaseMethodEnum } from '../core/enum/RouterBaseMethodEnum';
import { UserRoleIndex } from '../user-role/user-role.constant';
import { NKCurdControllerBase } from '../core/common/NKCurdControllerBase';
import { Reflector } from '@nestjs/core';
import { NKKey } from '../core/common/NKKey';
import { JoiValidatorPipe } from '../core/pipe';
import { CreateImportPlanDTO } from './dto/create-import-plan.dto';
import { Request, Response } from 'express';
import { UpdateImportPlanDTO } from './dto/update-import-plan.dto';
import { AddImportPlanItemDTO } from './dto/add-import-plan-item.dto';
import { UpdateImportPlanItemDTO } from './dto/update-import-plan-item.dto';
import { NKMethodUploadSingleFile } from '../core/decorators/NKMethodUpload.decorator';
import { NKUploadedFile } from '../core/decorators/NKUploadFile.decorator';
import { XlsxService } from '../xlsx/xlsx.service';
import { join } from 'path';
import { UpdateStatusImportPlanDTO } from './dto/update-status-import-plan.dto';

@NKAuthController({
    model: {
        type: ImportPlan,
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
    selectOptionField: 'code',
    query: {
        isShowDelete: false,
        relations: [
            'createdBy',
            'updatedBy',
            'createdBy.role',
            'updatedBy.role',
            'importPlanItems',
            'importInventories',
            'importInventories.importInventoryItems',
            'importInventories.importInventoryItems.supply',
            'importInventories.importInventoryItems.supply.supplyCategory',
            'importInventories.importInventoryItems.equipment',
            'importInventories.importInventoryItems.equipment.equipmentCategory',
        ],
    },
})
export class ImportPlanController extends NKCurdControllerBase<ImportPlan> {
    constructor(private readonly importPlanService: ImportPlanService, private readonly xlsxService: XlsxService) {
        const reflector = new Reflector();
        importPlanService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, ImportPlanController);
        super(importPlanService);
    }

    @NKMethodRouter(Post('/'))
    async createImportInventory(
        @Req() req: Request,
        @Body(new JoiValidatorPipe(CreateImportPlanDTO.validate)) body: CreateImportPlanDTO,
    ) {
        return this.importPlanService.createOne(req.user, body);
    }

    @NKMethodRouter(Put('/:id/approve'))
    async approveImportInventory(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Req() req: Request,
        @Body(new JoiValidatorPipe(UpdateStatusImportPlanDTO.validate)) body: UpdateStatusImportPlanDTO,
    ) {
        return this.importPlanService.approveImportPlan(req.user, id, body);
    }

    @NKMethodRouter(Put('/:id/submit'))
    async submitImportInventory(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Req() req: Request,
    ) {
        return this.importPlanService.submitImportPlan(req.user, id);
    }

    @NKMethodRouter(Put('/:id/cancel'))
    async rejectImportInventory(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Req() req: Request,
        @Body(new JoiValidatorPipe(UpdateStatusImportPlanDTO.validate)) body: UpdateStatusImportPlanDTO,
    ) {
        return this.importPlanService.cancelImportPlan(req.user, id, body);
    }

    @NKMethodRouter(Put('/:id'))
    async updateImportInventory(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Req() req: Request,
        @Body(new JoiValidatorPipe(UpdateImportPlanDTO.validate)) body: UpdateImportPlanDTO,
    ) {
        return this.importPlanService.updateOne(req.user, id, body);
    }

    @NKMethodRouter(Post('/:id/item'))
    async addImportInventoryItem(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Req() req: Request,
        @Body(new JoiValidatorPipe(AddImportPlanItemDTO.validate)) body: AddImportPlanItemDTO,
    ) {
        return this.importPlanService.addImportPlanItem(req.user, id, body);
    }

    @NKMethodUploadSingleFile(Put('/:id/item/upload'))
    async uploadImportInventoryItem(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Req() req: Request,

        @NKUploadedFile()
        file: Express.Multer.File,
    ) {
        const { incorrectData, correctData } = await this.importPlanService.addImportPlanItemByFile(req.user, id, file);
        let rtfPath = '';
        if (incorrectData.length > 3) {
            rtfPath = await this.xlsxService.writeIncorrectDataToDocx(incorrectData);
        }

        if (!incorrectData.length) {
            return {
                isIncorrectData: false,
                path: null,
                correctData: correctData,
                incorrectData: incorrectData,
                rtfPath,
            };
        }
        const xlsxPath = await this.xlsxService.createImportPlanXlsx(incorrectData);

        return {
            isIncorrectData: true,
            path: xlsxPath,
            correctData: correctData,
            incorrectData: incorrectData,
            rtfPath,
        };
    }

    @NKMethodRouter(Put('/:id/item/:itemId'))
    async updateImportInventoryItem(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Param('itemId', new ParseUUIDPipe())
        itemId: string,
        @Req() req: Request,
        @Body(new JoiValidatorPipe(UpdateImportPlanItemDTO.validate)) body: UpdateImportPlanItemDTO,
    ) {
        return this.importPlanService.updateImportPlanItem(req.user, id, itemId, body);
    }

    @NKMethodRouter(Delete('/:id/item/:itemId'))
    async deleteImportInventoryItem(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Param('itemId', new ParseUUIDPipe())
        itemId: string,
        @Req() req: Request,
    ) {
        return this.importPlanService.deleteImportPlanItem(req.user, id, itemId);
    }

    @NKMethodRouter(Put('change-complete/:id'))
    async changeComplete(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Req() req: Request,
    ) {
        return this.importPlanService.changeCompleteStatus(id);
    }

    @NKMethodRouter(Get('/enum-options/status'))
    getStatusOptions(): EnumListItem[] {
        return [
            {
                id: ImportPlanStatus.DRAFT,
                label: 'Nháp',
                name: 'Nháp',
                value: ImportPlanStatus.DRAFT,
                color: Colors.YELLOW,
                slug: kebabCase(ImportPlanStatus.DRAFT),
            },
            {
                id: ImportPlanStatus.SUBMITTED,
                label: 'Đã gửi',
                name: 'Đã gửi',
                value: ImportPlanStatus.SUBMITTED,
                color: Colors.BLUE,
                slug: kebabCase(ImportPlanStatus.SUBMITTED),
            },
            {
                id: ImportPlanStatus.APPROVED,
                label: 'Đã duyệt',
                name: 'Đã duyệt',
                value: ImportPlanStatus.APPROVED,
                color: Colors.GREEN,
                slug: kebabCase(ImportPlanStatus.APPROVED),
            },
            {
                id: ImportPlanStatus.COMPLETED,
                label: 'Hoàn thành',
                name: 'Hoàn thành',
                value: ImportPlanStatus.COMPLETED,
                color: Colors.ORANGE,
                slug: kebabCase(ImportPlanStatus.COMPLETED),
            },
            {
                id: ImportPlanStatus.CANCELLED,
                label: 'Đã hủy',
                name: 'Đã hủy',
                value: ImportPlanStatus.CANCELLED,
                color: Colors.RED,
                slug: kebabCase(ImportPlanStatus.CANCELLED),
            },
        ];
    }
}
