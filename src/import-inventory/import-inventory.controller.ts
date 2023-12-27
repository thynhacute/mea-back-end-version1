import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Req } from '@nestjs/common';
import { ImportInventoryService } from './import-inventory.service';
import { ImportInventory, ImportInventoryStatus } from './import-inventory.entity';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { UserRoleIndex } from '../user-role/user-role.constant';
import { NKCurdControllerBase } from '../core/common/NKCurdControllerBase';
import { Reflector } from '@nestjs/core';
import { NKKey } from '../core/common/NKKey';
import { RouterBaseMethodEnum } from '../core/enum/RouterBaseMethodEnum';
import { NKMethodRouter } from '../core/decorators/NKMethodRouter.decorator';
import { CreateImportInventoryDTO } from './dto/create-import-inventory.dto';
import { JoiValidatorPipe } from '../core/pipe';
import { Request } from 'express';
import { AddImportInventoryItemDTO } from './dto/add-import-inventory-item.dto';
import { UpdateImportInventoryItemDTO } from './dto/update-import-inventory-item.dto';
import { EnumListItem } from '../core/common/dtos/paging.dto';
import { kebabCase } from 'lodash';
import { Colors } from '../core/util/colors.helper';
import { NKMethodUploadSingleFile } from '../core/decorators/NKMethodUpload.decorator';
import { NKUploadedFile } from '../core/decorators/NKUploadFile.decorator';
import { UpdateStatusImportInventoryDTO } from './dto/update-status-import-inventory.dto';
import { UpdateImportInventoryDTO } from './dto/update-import-inventory.dto';
import { XlsxService } from 'src/xlsx/xlsx.service';

@NKAuthController({
    model: {
        type: ImportInventory,
    },
    baseMethods: [
        RouterBaseMethodEnum.GET_PAGING,
        RouterBaseMethodEnum.GET_ALL,
        RouterBaseMethodEnum.GET_ONE,
        RouterBaseMethodEnum.GET_SELECT_OPTION,
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
            'importPlan',
            'importPlan.importPlanItems',

            'importInventoryItems',
            'importInventoryItems.equipment',
            'importInventoryItems.equipment.equipmentCategory',
            'importInventoryItems.supply',
            'importInventoryItems.supply.supplyCategory',
        ],
    },
})
export class ImportInventoryController extends NKCurdControllerBase<ImportInventory> {
    constructor(
        private readonly importInventoryService: ImportInventoryService,
        private readonly xlsxService: XlsxService,
    ) {
        const reflector = new Reflector();
        importInventoryService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, ImportInventoryController);
        super(importInventoryService);
    }

    @NKMethodRouter(Post('/'))
    async createImportInventory(
        @Req() req: Request,
        @Body(new JoiValidatorPipe(CreateImportInventoryDTO.validate)) body: CreateImportInventoryDTO,
    ) {
        return this.importInventoryService.createOne(req.user, body);
    }

    @NKMethodUploadSingleFile(Put('/:id/item/upload'))
    async uploadImportInventoryItem(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Req() req: Request,
        @NKUploadedFile()
        file: Express.Multer.File,
    ) {
        const { incorrectData, correctData } = await this.importInventoryService.addImportInventoryItemByFile(
            req.user,
            id,
            file,
        );
        let rtfPath = '';
        if (incorrectData.length > 3) {
            console.log('incorrectData', incorrectData.length);
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
        const xlsxPath = await this.xlsxService.createImportInventoryXlsx(incorrectData);

        return {
            isIncorrectData: true,
            path: xlsxPath,
            correctData: correctData,
            incorrectData: incorrectData,
            rtfPath,
        };
    }

    @NKMethodRouter(Get('/supply/:id'))
    async getAllImportInventoryBySupplyId(
        @Param('id', new ParseUUIDPipe())
        id: string,
    ) {
        return this.importInventoryService.getExportImportInventoryItems(id);
    }

    @NKMethodRouter(Put('/:id/approve'))
    async approveImportInventory(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Req() req: Request,
        @Body(new JoiValidatorPipe(UpdateStatusImportInventoryDTO.validate))
        body: UpdateStatusImportInventoryDTO,
    ) {
        return this.importInventoryService.approveImportInventory(req.user, id, body);
    }

    @NKMethodRouter(Put('/:id/submit'))
    async submitImportInventory(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Req() req: Request,
    ) {
        return this.importInventoryService.submitImportInventory(req.user, id);
    }

    @NKMethodRouter(Put('/:id/cancel'))
    async rejectImportInventory(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Req() req: Request,
        @Body(new JoiValidatorPipe(UpdateStatusImportInventoryDTO.validate))
        body: UpdateStatusImportInventoryDTO,
    ) {
        return this.importInventoryService.cancelImportInventory(req.user, id, body);
    }

    @NKMethodRouter(Put('/:id'))
    async updateImportInventory(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Req() req: Request,
        @Body(new JoiValidatorPipe(UpdateImportInventoryDTO.validate)) body: UpdateImportInventoryDTO,
    ) {
        return this.importInventoryService.updateOne(req.user, id, body);
    }

    @NKMethodRouter(Post('/:id/item'))
    async addImportInventoryItem(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Req() req: Request,
        @Body(new JoiValidatorPipe(AddImportInventoryItemDTO.validate)) body: AddImportInventoryItemDTO,
    ) {
        return this.importInventoryService.addImportInventoryItem(req.user, id, body);
    }

    @NKMethodRouter(Put('/:id/item/:itemId'))
    async updateImportInventoryItem(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Param('itemId', new ParseUUIDPipe())
        itemId: string,
        @Req() req: Request,
        @Body(new JoiValidatorPipe(UpdateImportInventoryItemDTO.validate)) body: UpdateImportInventoryItemDTO,
    ) {
        return this.importInventoryService.updateImportInventoryItem(req.user, id, itemId, body);
    }

    @NKMethodRouter(Delete('/:id/item/:itemId'))
    async deleteImportInventoryItem(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Param('itemId', new ParseUUIDPipe())
        itemId: string,
        @Req() req: Request,
    ) {
        return this.importInventoryService.deleteImportInventoryItem(req.user, id, itemId);
    }

    @NKMethodRouter(Get('/enum-options/status'))
    getStatusOptions(): EnumListItem[] {
        return [
            {
                id: ImportInventoryStatus.DRAFT,
                label: 'Nháp',
                name: 'Nháp',
                value: ImportInventoryStatus.DRAFT,
                color: Colors.YELLOW,
                slug: kebabCase(ImportInventoryStatus.DRAFT),
            },
            {
                id: ImportInventoryStatus.REQUESTING,
                label: 'Yêu cầu',
                name: 'Yêu cầu',
                value: ImportInventoryStatus.REQUESTING,
                color: Colors.BLUE,
                slug: kebabCase(ImportInventoryStatus.REQUESTING),
            },
            {
                id: ImportInventoryStatus.APPROVED,
                label: 'Nhập kho',
                name: 'Nhập kho',
                value: ImportInventoryStatus.APPROVED,
                color: Colors.GREEN,
                slug: kebabCase(ImportInventoryStatus.APPROVED),
            },
            {
                id: ImportInventoryStatus.CANCELLED,
                label: 'Hủy phiếu',
                name: 'Hủy phiếu',
                value: ImportInventoryStatus.CANCELLED,
                color: Colors.RED,
                slug: kebabCase(ImportInventoryStatus.CANCELLED),
            },
        ];
    }
}
