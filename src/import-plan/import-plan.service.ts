import { HttpStatus, Injectable } from '@nestjs/common';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { NKService } from '../core/decorators/NKService.decorator';
import { ImportPlan, ImportPlanStatus } from './import-plan.entity';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { CreateImportPlanDTO } from './dto/create-import-plan.dto';
import { User } from '../user/user.entity';
import { ImportPlanItemService } from '../import-plan-item/import-plan-item.service';
import { NKGlobal } from '../core/common/NKGlobal';
import { NKResponseException, nkMessage } from '../core/exception';
import { UpdateImportPlanDTO } from './dto/update-import-plan.dto';
import { NKTransaction } from '../core/common/NKTransaction';
import { ImportPlanItem } from '../import-plan-item/import-plan-item.entity';
import { AddImportPlanItemDTO } from './dto/add-import-plan-item.dto';
import { UpdateImportPlanItemDTO } from './dto/update-import-plan-item.dto';
import xlsx from 'xlsx';
import _ from 'lodash';
import { isNumber } from 'class-validator';
import { getHashCodeCode, getSlugCode } from 'src/core/util';
import { XLSXErrorMessage, XLSXImportPlanItem, XLSXIncorrectItem } from 'src/core/interface/xlsx';
import { SelectOptionDto } from 'src/core/common/dtos/select-options.dto';
import { UserNotificationService } from 'src/user-notification/user-notification.service';
import { UserNotificationActionType } from 'src/user-notification/user-notification.entity';
import { UserRoleIndex } from 'src/user-role/user-role.constant';
import moment from 'moment';
import { UpdateStatusImportPlanDTO } from './dto/update-status-import-plan.dto';
import { SupplyService } from 'src/supply/supply.service';

@NKService()
export class ImportPlanService extends NKServiceBase<ImportPlan> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
        private readonly importPlanItemService: ImportPlanItemService,
        private readonly userNotificationService: UserNotificationService,
        private readonly supplyService: SupplyService,
    ) {
        super(entityManager.getRepository(ImportPlan));
    }

    generateSlugKey = async (date = moment()) => {
        let newSlug = `KH${date.format('DDMMYY')}${await getSlugCode()}`;

        while (await this.getOneByField('code', newSlug, false)) {
            newSlug = `KH${date.format('DDMMYY')}${await getSlugCode()}`;
        }

        return newSlug;
    };

    async restoreSlug() {
        console.log('restoreSlug');
        const importInventories = await NKGlobal.entityManager.find(ImportPlan, {
            where: {
                code: '',
            },
        });

        console.log('importInventories', importInventories.length);

        await Promise.all(
            importInventories.map(async (item) => {
                await NKGlobal.entityManager.update(
                    ImportPlan,
                    {
                        id: item.id,
                    },
                    {
                        code: await this.generateSlugKey(moment(new Date(item.createdAt))),
                    },
                );
            }),
        );
    }

    async addImportPlanItemByFile(user: User, id: string, file: Express.Multer.File) {
        const importPlan = await this.getDraftImportPlan(id);
        const workbook = xlsx.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = await xlsx.utils
            .sheet_to_json(sheet)
            .map((item, index) => ({ ...this.mapSheetToImportPlanItem(item), index }));

        const correctData = [];
        const incorrectData: XLSXIncorrectItem<XLSXImportPlanItem>[] = [];

        await Promise.all(
            data.map(async (item) => {
                const errors: XLSXErrorMessage[] = [];

                if (!item.name) {
                    errors.push({
                        column: 'Tên thiết bị',
                        message: 'không được để trống',
                        color: 'EA4335',
                    });
                }

                if (!item.code) {
                    errors.push({
                        column: 'Mã thiết bị',
                        message: 'không được để trống',
                        color: 'EA4335',
                    });
                }

                if (item.code) {
                    const supply = await this.supplyService.getOneByField('code', item.code, false);

                    if (!supply) {
                        errors.push({
                            column: 'Mã thiết bị',
                            message: 'không tồn tại trong hệ thống',
                            color: 'EA4335',
                        });
                    }
                }

                // check code is existed in file
                const existedItem = data.find((e) => e.code === item.code && e.index !== item.index);
                if (existedItem) {
                    errors.push({
                        column: 'Mã thiết bị',
                        message: 'trùng với mã thiết bị khác trong file',
                        color: 'EA4335',
                    });
                }

                if (!item.quantity) {
                    errors.push({
                        column: 'Số lượng',
                        message: 'không được để trống và phải lớn hơn 0',
                        color: 'EA4335',
                    });
                } else {
                    if (!isNumber(item.quantity) || item.quantity < 1) {
                        errors.push({
                            column: 'Số lượng',
                            message: 'không được để trống và phải lớn hơn 0',
                            color: '4285F4',
                        });
                    }
                }

                if (!item.unit) {
                    errors.push({
                        column: 'Đơn vị tính',
                        message: 'không được để trống',
                        color: 'EA4335',
                    });
                }

                if (!item.price) {
                    errors.push({
                        column: 'Đơn giá',
                        message: 'không được để trống và phải lớn hơn 0',
                        color: 'EA4335',
                    });
                } else {
                    if (!isNumber(item.price) || item.price < 1) {
                        errors.push({
                            column: 'Đơn giá',
                            message: 'không được để trống và phải lớn hơn 0',
                            color: '4285F4',
                        });
                    }
                }

                if (!item.description) {
                    errors.push({
                        column: 'Mô tả',
                        message: 'không được để trống',
                        color: 'EA4335',
                    });
                }

                if (!item.quantity) {
                    errors.push({
                        column: 'Số lượng',
                        message: 'không được để trống và phải lớn hơn 0',
                        color: 'EA4335',
                    });
                } else {
                    if (!isNumber(item.quantity) || item.quantity < 1) {
                        errors.push({
                            column: 'Số lượng',
                            message: 'không được để trống và phải lớn hơn 0',
                            color: '4285F4',
                        });
                    }
                }

                if (!item.brand) {
                    errors.push({
                        column: 'Hãng',
                        message: 'không được để trống',
                        color: 'EA4335',
                    });
                }

                if (!item.category) {
                    errors.push({
                        column: 'Loại thiết bị',
                        message: 'không được để trống',
                        color: 'EA4335',
                    });
                }

                if (!item.machine) {
                    errors.push({
                        column: 'Kiểu máy',
                        message: 'không được để trống',
                        color: 'EA4335',
                    });
                }
                if (!item.contact) {
                    errors.push({
                        column: 'Thông tin liên hệ',
                        message: 'không được để trống',
                        color: 'EA4335',
                    });
                }

                if (errors.length > 0) {
                    incorrectData.push({
                        data: item,
                        errors,
                    });
                } else {
                    correctData.push(item);
                }
            }),
        );

        await Promise.all(correctData.map((item) => this.addImportPlanItem(user, importPlan.id, item)));

        return {
            correctData,
            incorrectData,
        };
    }

    private mapSheetToImportPlanItem(data: Record<string, any>): XLSXImportPlanItem {
        return {
            name: _.get(data, 'Tên thiết bị'),
            code: _.get(data, 'Mã thiết bị'),
            machine: _.get(data, 'Kiểu máy'),
            category: _.get(data, 'Loại thiết bị'),
            brand: _.get(data, 'Hãng'),
            description: _.get(data, 'Mô tả'),
            quantity: _.get(data, 'Số lượng'),
            unit: _.get(data, 'Đơn vị tính'),
            price: _.get(data, 'Đơn giá'),
            total: _.get(data, 'Thành tiền'),
            contact: _.get(data, 'Thông tin liên hệ'),
        };
    }

    async getDraftImportPlan(id: string) {
        const importPlan = await this.getOneByField('id', id);

        if (importPlan.status !== ImportPlanStatus.DRAFT) {
            throw new NKResponseException(nkMessage.error.importPlanStatus, HttpStatus.BAD_REQUEST);
        }

        return importPlan;
    }

    async getSubmittedImportPlan(id: string) {
        const importPlan = await this.getOneByField('id', id);

        if (importPlan.status !== ImportPlanStatus.SUBMITTED) {
            throw new NKResponseException(nkMessage.error.importPlanStatus, HttpStatus.BAD_REQUEST);
        }

        return importPlan;
    }

    async createOne(user: User, dto: CreateImportPlanDTO) {
        return NKGlobal.entityManager.save(ImportPlan, {
            endImportDate: dto.endImportDate,
            startImportDate: dto.startImportDate,
            status: ImportPlanStatus.DRAFT,
            contractSymbol: await getHashCodeCode(),
            code: await this.generateSlugKey(),
            documentNumber: await getHashCodeCode(),
            name: dto.name,
            createdBy: {
                id: user.id,
            },
            updatedBy: {
                id: user.id,
            },
        });
    }

    async updateOne(user: User, id: string, dto: UpdateImportPlanDTO) {
        const importPlan = await this.getDraftImportPlan(id);

        return await NKGlobal.entityManager.update(
            ImportPlan,
            {
                id: importPlan.id,
            },
            {
                endImportDate: dto.endImportDate,
                startImportDate: dto.startImportDate,
                status: ImportPlanStatus.DRAFT,
                name: dto.name,
                updatedBy: {
                    id: user.id,
                },
            },
        );
    }

    async deleteImportPlanItem(user: User, id: string, itemId: string) {
        // check import plan status
        await this.getDraftImportPlan(id);

        return await NKTransaction.transaction(
            NKGlobal.entityManager,
            async (entityManager) => {
                const importPlan = await this.getDraftImportPlan(id);

                await entityManager.delete(ImportPlanItem, {
                    id: itemId,
                });

                await entityManager.update(
                    ImportPlan,
                    {
                        id: importPlan.id,
                    },
                    {
                        updatedBy: {
                            id: user.id,
                        },
                    },
                );
            },
            {},
        );
    }

    async addImportPlanItem(user: User, id: string, dto: AddImportPlanItemDTO) {
        const importPlan = await this.getDraftImportPlan(id);

        const existedItem = importPlan.importPlanItems.find((item) => item.code === dto.code);
        //add quantity if item is existed
        if (existedItem) {
            return await NKTransaction.transaction(
                NKGlobal.entityManager,
                async (entityManager) => {
                    await entityManager.update(
                        ImportPlanItem,
                        {
                            id: existedItem.id,
                        },
                        {
                            quantity: existedItem.quantity + dto.quantity,
                        },
                    );

                    await entityManager.update(
                        ImportPlan,
                        {
                            id: importPlan.id,
                        },
                        {
                            updatedBy: {
                                id: user.id,
                            },
                        },
                    );
                },
                {},
            );
        }

        return await NKTransaction.transaction(
            NKGlobal.entityManager,
            async (entityManager) => {
                await entityManager.save(ImportPlanItem, {
                    quantity: dto.quantity,
                    price: dto.price,
                    name: dto.name,
                    code: dto.code,
                    machine: dto.machine,
                    category: dto.category,
                    description: dto.description,
                    unit: dto.unit,
                    brand: dto.brand,
                    contact: dto.contact,
                    importPlan: {
                        id: importPlan.id,
                    },
                });

                await entityManager.update(
                    ImportPlan,
                    {
                        id: importPlan.id,
                    },
                    {
                        updatedBy: {
                            id: user.id,
                        },
                    },
                );
            },
            {},
        );
    }

    async updateImportPlanItem(user: User, id: string, itemId: string, dto: UpdateImportPlanItemDTO) {
        const importPlan = await this.getDraftImportPlan(id);

        return NKTransaction.transaction(
            NKGlobal.entityManager,
            async (entityManager) => {
                await entityManager.update(
                    ImportPlanItem,
                    {
                        id: itemId,
                    },
                    {
                        quantity: dto.quantity,
                        price: dto.price,
                        name: dto.name,
                        code: dto.code,
                        machine: dto.machine,
                        category: dto.category,
                        description: dto.description,
                        unit: dto.unit,
                        brand: dto.brand,
                        contact: dto.contact,
                    },
                );

                await entityManager.update(
                    ImportPlan,
                    {
                        id: importPlan.id,
                    },
                    {
                        updatedBy: {
                            id: user.id,
                        },
                    },
                );
            },
            {},
        );
    }

    async approveImportPlan(user: User, id: string, dto: UpdateStatusImportPlanDTO) {
        const importPlan = await this.getSubmittedImportPlan(id);

        await this.userNotificationService.sendNotificationByRole(
            [UserRoleIndex.FACILITY_MANAGER, UserRoleIndex.INVENTORY_MANAGER],
            {
                actionId: importPlan.id,
                actionType: UserNotificationActionType.IMPORT_PLAN_LINK,
                content: importPlan.note,
                title: `Quản trị viên vừa duyệt đơn kế hoạch mua sắm ${importPlan.code}}`,
                receiverIds: [],
                senderId: '',
            },
        );

        await this.userNotificationService.sendNotificationByRole([UserRoleIndex.INVENTORY_MANAGER], {
            actionId: importPlan.id,
            actionType: UserNotificationActionType.IMPORT_PLAN_LINK,
            content: `Bạn có 1 kế hoạch mua sắm thiết bị mới`,
            title: `Bạn có 1 kế hoạch mua sắm thiết bị mới`,
            receiverIds: [],
            senderId: '',
        });

        return NKTransaction.transaction(
            NKGlobal.entityManager,
            async (entityManager) => {
                await entityManager.update(
                    ImportPlan,
                    {
                        id: importPlan.id,
                    },
                    {
                        note: dto.note,
                        status: ImportPlanStatus.APPROVED,
                        updatedBy: {
                            id: user.id,
                        },
                    },
                );
            },
            {},
        );
    }

    async submitImportPlan(user: User, id: string) {
        const importPlan = await this.getDraftImportPlan(id);

        //check item is not empty
        if (importPlan.importPlanItems.length === 0) {
            throw new NKResponseException(nkMessage.error.importPlanItemEmpty, HttpStatus.BAD_REQUEST);
        }

        await this.userNotificationService.sendNotificationByRole([UserRoleIndex.ADMIN], {
            actionId: importPlan.id,
            actionType: UserNotificationActionType.IMPORT_PLAN_LINK,
            content: `${importPlan.note}`,
            receiverIds: [],
            senderId: '',
            title: `Quản lý vật tư vừa gửi đơn kế hoạch mua sắm ${importPlan.code}`,
        });

        return NKTransaction.transaction(
            NKGlobal.entityManager,
            async (entityManager) => {
                await entityManager.update(
                    ImportPlan,
                    {
                        id: importPlan.id,
                    },
                    {
                        status: ImportPlanStatus.SUBMITTED,
                        updatedBy: {
                            id: user.id,
                        },
                    },
                );
            },
            {},
        );
    }

    async cancelImportPlan(user: User, id: string, dto: UpdateStatusImportPlanDTO) {
        const importPlan = await this.getOneByField('id', id);
        await this.userNotificationService.sendNotificationByRole([UserRoleIndex.FACILITY_MANAGER], {
            actionId: importPlan.id,
            actionType: UserNotificationActionType.IMPORT_PLAN_LINK,
            content: `Kế hoạch mua sắm thiết bị của bạn đã bị từ chối.`,
            title: `Kế hoạch mua sắm thiết bị của bạn đã bị từ chối.`,
            receiverIds: [],
            senderId: '',
        });
        return await NKGlobal.entityManager.update(
            ImportPlan,
            {
                id,
            },
            {
                note: dto.note,
                status: ImportPlanStatus.CANCELLED,
                updatedBy: {
                    id: user.id,
                },
            },
        );
    }

    async getSelectOption(dto: SelectOptionDto) {
        const res = await super.getSelectOption(dto);

        return res.filter((e) => {
            return e.status !== ImportPlanStatus.DRAFT;
        });
    }

    async changeCompleteStatus(id: string) {
        const importRequest = await this.getOneByField('id', id);

        return await NKGlobal.entityManager.update(
            ImportPlan,
            {
                id: importRequest.id,
            },
            {
                status: ImportPlanStatus.COMPLETED,
            },
        );
    }
}
