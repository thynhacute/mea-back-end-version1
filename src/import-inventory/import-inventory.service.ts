import { HttpStatus, Injectable } from '@nestjs/common';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { NKService } from '../core/decorators/NKService.decorator';
import { ImportInventory, ImportInventoryStatus } from './import-inventory.entity';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { CreateImportInventoryDTO } from './dto/create-import-inventory.dto';
import { NKGlobal } from '../core/common/NKGlobal';
import { User } from '../user/user.entity';
import { NKResponseException, nkMessage } from '../core/exception';
import { AddImportInventoryItemDTO } from './dto/add-import-inventory-item.dto';
import { NKTransaction } from '../core/common/NKTransaction';
import { SupplyService } from '../supply/supply.service';
import { EquipmentService } from '../equipment/equipment.service';
import { ImportInventoryItem } from '../import-inventory-item/import-inventory-item.entity';
import { EquipmentStatus, EquipmentStatusType } from '../equipment-status/equipment-status.entity';
import { UpdateImportInventoryItemDTO } from './dto/update-import-inventory-item.dto';
import { ImportInventoryItemService } from '../import-inventory-item/import-inventory-item.service';
import { Supply } from '../supply/supply.entity';
import { Equipment } from '../equipment/equipment.entity';
import { EquipmentStatusService } from '../equipment-status/equipment-status.service';
import xlsx from 'xlsx';
import _, { isDate } from 'lodash';
import { isNumber } from 'class-validator';
import { EquipmentCategory } from '../equipment-category/equipment-category.entity';
import { UpdateStatusImportInventoryDTO } from './dto/update-status-import-inventory.dto';
import { UpdateImportInventoryDTO } from './dto/update-import-inventory.dto';
import moment from 'moment';
import { EquipmentCategoryService } from 'src/equipment-category/equipment-category.service';
import { getHashCodeCode, getSlugCode } from 'src/core/util';
import { XLSXErrorMessage, XLSXImportInventoryItem, XLSXIncorrectItem } from 'src/core/interface/xlsx';
import { SupplyCategoryService } from 'src/supply-category/supply-category.service';
import { SelectOptionDto } from 'src/core/common/dtos/select-options.dto';
import { ImportPlan, ImportPlanStatus } from 'src/import-plan/import-plan.entity';
import { ImportPlanService } from 'src/import-plan/import-plan.service';

@NKService()
export class ImportInventoryService extends NKServiceBase<ImportInventory> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
        private readonly supplyService: SupplyService,
        private readonly supplyCategoryService: SupplyCategoryService,
        private readonly equipmentService: EquipmentService,
        private readonly importEquipmentItemService: ImportInventoryItemService,
        private readonly importPlanService: ImportPlanService,
        private readonly equipmentStatusService: EquipmentStatusService,
        private readonly equipmentCategoryService: EquipmentCategoryService,
    ) {
        super(entityManager.getRepository(ImportInventory));
    }

    async restoreSlug() {
        console.log('restoreSlug');
        const exportInventories = await NKGlobal.entityManager.find(ImportInventory, {
            where: {
                code: '',
            },
        });

        console.log('exportInventories', exportInventories.length);

        await Promise.all(
            exportInventories.map(async (item) => {
                await NKGlobal.entityManager.update(
                    ImportInventory,
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

    generateSlugKey = async (date = moment()) => {
        let newSlug = `NK${date.format('DDMMYY')}${await getSlugCode()}`;

        while (await this.getOneByField('code', newSlug, false)) {
            newSlug = `NK${date.format('DDMMYY')}${await getSlugCode()}`;
        }

        return newSlug;
    };

    async getRequestingImportInventory(id: string) {
        const importInventory = await this.getOneByField('id', id);

        if (importInventory.status !== ImportInventoryStatus.REQUESTING) {
            throw new NKResponseException(nkMessage.error.importInventoryStatus, HttpStatus.BAD_REQUEST);
        }

        return importInventory;
    }

    async getDraftImportInventory(id: string) {
        const importInventory = await this.getOneByField('id', id);

        if (importInventory.status !== ImportInventoryStatus.DRAFT) {
            throw new NKResponseException(nkMessage.error.importInventoryStatus, HttpStatus.BAD_REQUEST);
        }

        return importInventory;
    }

    async createOne(user: User, data: CreateImportInventoryDTO) {
        return await NKGlobal.entityManager.save(ImportInventory, {
            name: data.name,
            note: data.note,
            importDate: data.importDate,
            status: ImportInventoryStatus.DRAFT,
            contractSymbol: await getHashCodeCode(),
            code: await this.generateSlugKey(),
            documentNumber: await getHashCodeCode(),
            createdBy: {
                id: user.id,
            },
            updatedBy: {
                id: user.id,
            },
            importPlan: {
                id: data.importPlanId || null,
            },
        });
    }

    async updateOne(user: User, id: string, data: UpdateImportInventoryDTO) {
        const importInventory = await this.getDraftImportInventory(id);

        return await NKGlobal.entityManager.update(
            ImportInventory,
            {
                id: importInventory.id,
            },
            {
                name: data.name,
                note: data.note,
                importDate: data.importDate,
                status: ImportInventoryStatus.DRAFT,
                updatedBy: {
                    id: user.id,
                },
                importPlan: {
                    id: data.importPlanId || null,
                },
            },
        );
    }

    async deleteImportInventoryItem(user: User, id: string, itemId: string) {
        // check import inventory status
        await this.getDraftImportInventory(id);

        return await NKTransaction.transaction(
            NKGlobal.entityManager,
            async (entityManager) => {
                const importInventory = await this.getDraftImportInventory(id);

                await entityManager.delete(ImportInventoryItem, {
                    id: itemId,
                });

                await entityManager.update(
                    ImportInventory,
                    {
                        id: importInventory.id,
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

    async addImportInventoryItem(user: User, id: string, dto: AddImportInventoryItemDTO) {
        if ((dto.supplyId && dto.equipmentId) || (!dto.supplyId && !dto.equipmentId)) {
            throw new NKResponseException(
                nkMessage.error.importInventoryItemOnlySupplyOrEquipment,
                HttpStatus.BAD_REQUEST,
            );
        }

        const importInventory = await this.getDraftImportInventory(id);

        if (dto.supplyId) {
            await this.supplyService.getOneByField('id', dto.supplyId);
            // check exist import inventory item that the same supply, mfDate, expiredDate
            const existedItem = await NKGlobal.entityManager.findOne(ImportInventoryItem, {
                where: {
                    supply: dto.supplyId ? { id: dto.supplyId } : null,
                    mfDate: new Date(dto.mfDate),
                    expiredDate: new Date(dto.expiredDate),
                    importInventory: {
                        id: importInventory.id,
                    },
                },
                relations: ['importInventory'],
            });

            // update quantity if existed
            if (existedItem) {
                return await NKTransaction.transaction(
                    NKGlobal.entityManager,
                    async (entityManager) => {
                        await entityManager.update(
                            ImportInventoryItem,
                            {
                                id: existedItem.id,
                            },
                            {
                                quantity: () => `quantity + ${dto.quantity}`,
                            },
                        );

                        await entityManager.update(
                            ImportInventory,
                            {
                                id: importInventory.id,
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
        }

        if (dto.equipmentId) {
            const equipment = await this.equipmentService.getOneByField('id', dto.equipmentId);
            const currentStatus = await this.equipmentStatusService.getCurrentStatus(equipment.id);
            const isDraftStatus = currentStatus.currentStatus === EquipmentStatusType.DRAFT;

            if (dto.quantity > 1) {
                throw new NKResponseException(nkMessage.error.equipmentMustBeOne, HttpStatus.BAD_REQUEST);
            }

            if (!isDraftStatus) {
                throw new NKResponseException(nkMessage.error.equipmentMustBeDraft, HttpStatus.BAD_REQUEST);
            }
        }

        return await NKTransaction.transaction(
            NKGlobal.entityManager,
            async (entityManager) => {
                await entityManager.save(ImportInventoryItem, {
                    quantity: dto.quantity,
                    price: dto.price,
                    mfDate: new Date(dto.mfDate),
                    expiredDate: new Date(dto.expiredDate),
                    endOfWarrantyDate: new Date(dto.endOfWarrantyDate),
                    note: dto.note,
                    importInventory: {
                        id: importInventory.id,
                    },
                    supply: dto.supplyId
                        ? {
                              id: dto.supplyId,
                          }
                        : null,
                    equipment: dto.equipmentId
                        ? {
                              id: dto.equipmentId,
                          }
                        : null,
                });

                await entityManager.update(
                    ImportInventory,
                    {
                        id: importInventory.id,
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

    async updateImportInventoryItem(user: User, id: string, itemId: string, dto: UpdateImportInventoryItemDTO) {
        const importInventory = await this.getDraftImportInventory(id);
        const importInventoryItem = await this.importEquipmentItemService.getOneByField('id', itemId);

        if (importInventoryItem.equipment && dto.quantity > 1) {
            throw new NKResponseException(nkMessage.error.equipmentQuantityMustBeOne, HttpStatus.BAD_REQUEST);
        }

        return NKTransaction.transaction(
            NKGlobal.entityManager,
            async (entityManager) => {
                await entityManager.update(
                    ImportInventoryItem,
                    {
                        id: itemId,
                    },
                    {
                        quantity: dto.quantity,
                        price: dto.price,
                        note: dto.note,
                        mfDate: dto.mfDate,
                        expiredDate: dto.expiredDate,
                        endOfWarrantyDate: dto.endOfWarrantyDate,
                    },
                );

                await entityManager.update(
                    ImportInventory,
                    {
                        id: importInventory.id,
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

    async approveImportInventory(user: User, id: string, dto: UpdateStatusImportInventoryDTO) {
        const importInventory = await this.getRequestingImportInventory(id);

        //check item not empty
        if (importInventory.importInventoryItems.length === 0) {
            throw new NKResponseException(nkMessage.error.importInventoryItemEmpty, HttpStatus.BAD_REQUEST);
        }

        return NKTransaction.transaction(
            NKGlobal.entityManager,
            async (entityManager) => {
                await Promise.all(
                    importInventory.importInventoryItems.map(async (item) => {
                        if (item.supply) {
                            await entityManager.update(
                                Supply,
                                {
                                    id: item.supply.id,
                                },
                                {
                                    quantity: () => `quantity + ${item.quantity}`,
                                },
                            );
                        }

                        if (item.equipment) {
                            await this.equipmentStatusService.addOne(
                                item.equipment.id,
                                EquipmentStatusType.IDLE,
                                'Nhập kho',
                            );

                            //update import date for equipment
                            await entityManager.update(
                                Equipment,
                                {
                                    id: item.equipment.id,
                                },
                                {
                                    importDate: importInventory.importDate,
                                },
                            );
                        }
                    }),
                );

                await entityManager.update(
                    ImportInventory,
                    {
                        id: importInventory.id,
                    },
                    {
                        note: dto.note,
                        status: ImportInventoryStatus.APPROVED,
                        updatedBy: {
                            id: user.id,
                        },
                    },
                );
            },
            {},
        );
    }

    async cancelImportInventory(user: User, id: string, dto: UpdateStatusImportInventoryDTO) {
        await this.getOneByField('id', id);

        return await NKGlobal.entityManager.update(
            ImportInventory,
            {
                id,
            },
            {
                note: dto.note,
                status: ImportInventoryStatus.CANCELLED,
                updatedBy: {
                    id: user.id,
                },
            },
        );
    }

    async submitImportInventory(user: User, id: string) {
        const importInventory = await this.getDraftImportInventory(id);

        //check item not empty
        if (importInventory.importInventoryItems.length === 0) {
            throw new NKResponseException(nkMessage.error.importInventoryItemEmpty, HttpStatus.BAD_REQUEST);
        }

        return await NKGlobal.entityManager.update(
            ImportInventory,
            {
                id,
            },
            {
                status: ImportInventoryStatus.REQUESTING,
                updatedBy: {
                    id: user.id,
                },
            },
        );
    }

    async requestImportInventory(user: User, id: string) {
        await this.getOneByField('id', id);

        return await NKGlobal.entityManager.update(
            ImportInventory,
            {
                id,
            },
            {
                status: ImportInventoryStatus.REQUESTING,
                updatedBy: {
                    id: user.id,
                },
            },
        );
    }

    async getExportImportInventoryItems(supplyId: string) {
        const importInventoryItems = await this.importEquipmentItemService.getManyByField('supplyId', [supplyId]);
        // FILTER BY IMPORT INVENTORY STATUS
        return importInventoryItems.filter((item) => {
            return item.importInventory.status === ImportInventoryStatus.APPROVED;
        });
    }

    async addImportInventoryItemByFile(user: User, id: string, file: Express.Multer.File) {
        const importInventory = await this.getDraftImportInventory(id);
        const workbook = xlsx.read(file.buffer, { type: 'buffer', cellDates: true, cellNF: false, cellText: false });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = await xlsx.utils
            .sheet_to_json(sheet)
            .map((item, index) => ({ index, ...this.mapSheetToImportInventoryItem(item) }));

        const supplies = [];
        const equipments = [];
        const incorrectData: XLSXIncorrectItem<XLSXImportInventoryItem>[] = [];

        await Promise.all(
            data.map(async (item) => {
                const errors: XLSXErrorMessage[] = [];

                if (!item.name) {
                    errors.push({
                        column: 'Tên hàng',
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

                const equipmentCategory = await this.equipmentCategoryService.getOneByField(
                    'name',
                    item.category,
                    false,
                );

                const supplyCategory = await this.supplyCategoryService.getOneByField('name', item.category, false);

                if (!item.code) {
                    errors.push({
                        column: 'Mã thiết bị',
                        message: 'không được để trống',
                        color: 'EA4335',
                    });
                }

                if (equipmentCategory) {
                    if (importInventory.importPlan) {
                        errors.push({
                            column: 'Loại thiết bị',
                            message: 'không được nhập thiết bị trong kế hoạch',
                            color: 'EA4335',
                        });
                    } else {
                        const equipment = await NKGlobal.entityManager.findOne(Equipment, {
                            code: item.code,
                        });

                        if (equipment) {
                            errors.push({
                                column: 'Mã thiết bị',
                                message: 'đã tồn tại',
                                color: 'FBBC04',
                            });
                        }

                        // check duplicate code in file
                        const existedEquipment = equipments.find((e) => e.code === item.code);
                        if (existedEquipment) {
                            errors.push({
                                column: 'Mã thiết bị',
                                message: 'trùng mã thiết bị trong file',
                                color: 'FBBC04',
                            });
                        }
                    }
                }

                if (supplyCategory) {
                    const supply = await NKGlobal.entityManager.findOne(Supply, {
                        code: item.code,
                    });

                    if (!supply) {
                        errors.push({
                            column: 'Mã thiết bị',
                            message: 'không tồn tại (vật tư)',
                            color: 'EA4335',
                        });
                    } else {
                        // if (importInventory.importPlan) {
                        //     const existedItem = importInventory.importInventoryItems.find(
                        //         (e) => e.supply.id === supply.id,
                        //     );
                        //     if (existedItem) {
                        //         errors.push({
                        //             column: 'Mã thiết bị',
                        //             message: 'đã tồn tại trong kế hoạch',
                        //             color: 'FBBC04',
                        //         });
                        //     }
                        // }
                    }
                }

                if (!equipmentCategory && !supplyCategory) {
                    errors.push({
                        column: 'Loại thiết bị',
                        message: 'không tồn tại',
                        color: '4285F4',
                    });
                }

                if (!item.mfd) {
                    errors.push({
                        column: 'Ngày sản xuất',
                        message: 'không được để trống',
                        color: 'EA4335',
                    });
                } else {
                    if (!isDate(new Date(item.mfd))) {
                        errors.push({
                            column: 'Ngày sản xuất',
                            message: 'không đúng định dạng',
                            color: '4285F4',
                        });
                    }
                }

                if (!item.expiredDate) {
                    errors.push({
                        column: 'Hạn dùng',
                        message: 'không được để trống',
                        color: 'EA4335',
                    });
                } else {
                    if (!isDate(new Date(item.expiredDate))) {
                        errors.push({
                            column: 'Hạn dùng',
                            message: 'không đúng định dạng',
                            color: '4285F4',
                        });
                    }
                }

                //expiredDate must be geater than today
                if (item.expiredDate && new Date(item.expiredDate) < new Date()) {
                    errors.push({
                        column: 'Hạn dùng',
                        message: 'phải lớn hơn ngày hiện tại',
                        color: '4285F4',
                    });
                }

                // expiredDate must be greater than mfd
                if (item.expiredDate && item.mfd && new Date(item.expiredDate) < new Date(item.mfd)) {
                    errors.push({
                        column: 'Hạn dùng',
                        message: 'phải lớn hơn ngày sản xuất',
                        color: '4285F4',
                    });
                }

                // check mfd must be before today
                if (item.mfd && new Date(item.mfd) > new Date()) {
                    errors.push({
                        column: 'Ngày sản xuất',
                        message: 'phải nhỏ hơn ngày hiện tại',
                        color: '4285F4',
                    });
                }

                if (!item.warrantyDate) {
                    errors.push({
                        column: 'Ngày bảo hành',
                        message: 'không được để trống',
                        color: 'EA4335',
                    });
                } else {
                    if (!isDate(new Date(item.warrantyDate))) {
                        errors.push({
                            column: 'Ngày bảo hành',
                            message: 'không đúng định dạng',
                            color: '4285F4',
                        });
                    }
                }

                // warrantyDate must be greater than mfd
                if (item.warrantyDate && item.mfd && new Date(item.warrantyDate) < new Date(item.mfd)) {
                    errors.push({
                        column: 'Ngày bảo hành',
                        message: 'phải lớn hơn ngày sản xuất',
                        color: '4285F4',
                    });
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
                        message: 'không được để trống',
                        color: 'EA4335',
                    });
                } else {
                    if (item.quantity < 1 || !isNumber(item.quantity)) {
                        errors.push({
                            column: 'Số lượng',
                            message: 'không được để trống và lớn hơn 0',
                            color: '4285F4',
                        });
                    }

                    // check quantity not greater than import plan quantity
                    if (importInventory.importPlan && supplyCategory) {
                        const importPlanItem = importInventory.importPlan.importPlanItems.find(
                            (e) => String(e.code) === String(item.code),
                        );

                        if (!importPlanItem) {
                            errors.push({
                                column: 'Mã thiết bị',
                                message: 'không tồn tại trong kế hoạch',
                                color: 'EA4335',
                            });
                        } else {
                            const importPlan = await this.importPlanService.getOneByField(
                                'id',
                                importInventory.importPlan.id,
                                false,
                            );

                            const importedInventoryQuantity = (
                                importPlan.importInventories.filter(
                                    (i) => i.status === 'APPROVED' || i.id === importInventory.id,
                                ) || []
                            )
                                .map((subItem) => {
                                    return subItem.importInventoryItems.filter((i) => i.supply.code === item?.code);
                                })
                                .flat()
                                .reduce((a, b) => a + b.quantity, 0);

                            const existInFileQuantity = supplies
                                .filter((e) => e.code === item.code)
                                .reduce((a, b) => {
                                    return a + b.quantity;
                                }, 0);

                            console.log(
                                importPlanItem.quantity,
                                Number(item.quantity),
                                importedInventoryQuantity,
                                existInFileQuantity,
                            );

                            if (
                                importPlanItem.quantity <
                                Number(item.quantity) + importedInventoryQuantity + existInFileQuantity
                            ) {
                                errors.push({
                                    column: 'Số lượng',
                                    message: 'không được lớn hơn số lượng trong kế hoạch',
                                    color: '4285F4',
                                });
                            }
                        }
                    }
                }

                if (!item.price) {
                    errors.push({
                        column: 'Đơn giá',
                        message: 'không được để trống và lớn hơn 0',
                        color: 'EA4335',
                    });
                } else {
                    if (item.price < 1 || !isNumber(item.price)) {
                        errors.push({
                            column: 'Đơn giá',
                            message: 'không được để trống và lớn hơn 0',
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

                //check is equipment, quantity must be 1
                if (equipmentCategory && item.quantity > 1) {
                    errors.push({
                        column: 'Số lượng',
                        message: 'phải là 1',
                        color: '4285F4',
                    });
                }

                if (errors.length > 0) {
                    incorrectData.push({
                        data: item,
                        errors,
                    });
                } else {
                    if (item.category) {
                        const category = await this.equipmentCategoryService.getOneByField(
                            'name',
                            item.category,
                            false,
                        );
                        if (category) {
                            equipments.push(item);
                        } else {
                            supplies.push(item);
                        }
                    }
                }
            }),
        );

        for (const item of supplies) {
            const supply = await this.supplyService.getOneByField('code', item.code, false);

            //check exist supply
            await this.addImportInventoryItem(user, importInventory.id, {
                endOfWarrantyDate: moment(item.warrantyDate, 'DD/MM/YYYY').toDate(),
                equipmentId: null,
                supplyId: supply.id,
                expiredDate: moment(item.expiredDate, 'DD/MM/YYYY').toDate(),
                mfDate: moment(item.mfd, 'DD/MM/YYYY').toDate(),
                price: item.price,
                quantity: item.quantity,
                note: item.description,
            });
        }

        for (const item of equipments) {
            const categoryCode = item.category;

            const equipmentCategory = await NKGlobal.entityManager.findOne(EquipmentCategory, {
                name: categoryCode,
            });

            const equipment = (await this.equipmentService.createOne({
                code: item.code,
                description: item.description,
                endOfWarrantyDate: moment(item.warrantyDate, 'DD/MM/YYYY').toDate(),
                equipmentCategoryId: equipmentCategory.id,
                equipmentStatus: EquipmentStatusType.DRAFT,
                imageUrls: ['https://cdn-icons-png.flaticon.com/512/9288/9288312.png'],
                importDate: importInventory.importDate,
                mfDate: moment(item.mfd, 'DD/MM/YYYY').toDate(),
                name: item.name,
                brandId: null,
            })) as Equipment;

            await this.addImportInventoryItem(user, importInventory.id, {
                endOfWarrantyDate: moment(item.warrantyDate, 'DD/MM/YYYY').toDate(),
                equipmentId: equipment.id,
                supplyId: null,
                expiredDate: moment(item.expiredDate, 'DD/MM/YYYY').toDate(),
                mfDate: moment(item.mfd, 'DD/MM/YYYY').toDate(),
                price: item.price,
                quantity: item.quantity,
                note: item.description,
            });
        }

        return {
            incorrectData,
            correctData: [...equipments, ...supplies],
        };
    }

    private mapSheetToImportInventoryItem(data: Record<string, any>) {
        return {
            name: _.get(data, 'Tên hàng'),
            code: _.get(data, 'Mã thiết bị'),
            category: _.get(data, 'Loại thiết bị'),
            mfd: _.get(data, 'Ngày sản xuất'),
            expiredDate: _.get(data, 'Hạn dùng'),
            warrantyDate: _.get(data, 'Ngày bảo hành'),
            description: _.get(data, 'Mô tả'),
            quantity: _.get(data, 'Số lượng'),
            unit: _.get(data, 'Đơn vị tính'),
            price: _.get(data, 'Đơn giá'),
        };
    }

    async getSelectOption(dto: SelectOptionDto) {
        const res = await super.getSelectOption(dto);

        return res.filter((e) => {
            return e.status !== ImportInventoryStatus.DRAFT;
        });
    }
}
