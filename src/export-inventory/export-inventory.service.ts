import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { ExportInventory, ExportInventoryStatus } from './export-inventory.entity';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { EntityManager, In } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { NKResponseException, nkMessage } from '../core/exception';

import { CreateExportInventoryDTO } from './dto/create-export-inventory.dto';
import { NKGlobal } from '../core/common/NKGlobal';
import { User } from '../user/user.entity';
import { UpdateExportInventoryDTO } from './dto/update-export-inventory.dto';
import { NKTransaction } from '../core/common/NKTransaction';
import { ExportInventoryItem } from '../export-inventory-item/export-inventory-item.entity';
import { UpdateStatusExportInventoryDTO } from './dto/update-status-export-inventory.dto';
import { AddExportInventoryItemDTO } from './dto/add-export-inventory-item.dto';
import { SupplyService } from '../supply/supply.service';
import { EquipmentService } from '../equipment/equipment.service';
import { EquipmentStatusType } from '../equipment-status/equipment-status.entity';
import { EquipmentStatusService } from '../equipment-status/equipment-status.service';
import { UpdateExportInventoryItemDTO } from './dto/update-export-inventory-item.dto';
import { ExportInventoryItemService } from '../export-inventory-item/export-inventory-item.service';
import { Supply } from '../supply/supply.entity';
import { Equipment } from '../equipment/equipment.entity';
import { getHashCodeCode, getSlugCode } from 'src/core/util';
import { UserNotificationService } from 'src/user-notification/user-notification.service';
import { UserRoleIndex } from 'src/user-role/user-role.constant';
import { UserNotificationActionType } from 'src/user-notification/user-notification.entity';
import { DepartmentService } from 'src/department/department.service';
import { ImportRequestCron } from 'src/import-request/import-request.cron';
import moment from 'moment';
import { ImportRequest, ImportRequestStatus } from 'src/import-request/import-request.entity';
import { ImportRequestService } from 'src/import-request/import-request.service';
import { RepairReportService } from 'src/repair-report/repair-report.service';

@Injectable()
export class ExportInventoryService extends NKServiceBase<ExportInventory> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
        private readonly supplyService: SupplyService,
        private readonly equipmentStatusService: EquipmentStatusService,
        private readonly equipmentService: EquipmentService,
        private readonly exportInventoryItemService: ExportInventoryItemService,
        private readonly userNotificationService: UserNotificationService,
        private readonly departmentService: DepartmentService,
        private readonly importRequestService: ImportRequestService,
        private readonly importRequestCron: ImportRequestCron,
        private readonly repairReportService: RepairReportService,
    ) {
        super(entityManager.getRepository(ExportInventory));
    }

    async restoreSlug() {
        console.log('restoreSlug');
        const exportInventories = await NKGlobal.entityManager.find(ExportInventory, {
            where: {
                code: '',
            },
        });

        console.log('exportInventories', exportInventories.length);

        await Promise.all(
            exportInventories.map(async (item) => {
                await NKGlobal.entityManager.update(
                    ExportInventory,
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
        let newSlug = `XK${date.format('DDMMYY')}${await getSlugCode()}`;

        while (await this.getOneByField('code', newSlug, false)) {
            newSlug = `XK${date.format('DDMMYY')}${await getSlugCode()}`;
        }

        return newSlug;
    };

    async getRequestingExportInventory(id: string) {
        const exportInventory = await this.getOneByField('id', id);

        if (exportInventory.status !== ExportInventoryStatus.REQUESTING) {
            throw new NKResponseException(nkMessage.error.exportInventoryStatus, HttpStatus.BAD_REQUEST);
        }

        return exportInventory;
    }

    async createOne(user: User, data: CreateExportInventoryDTO) {
        return await NKGlobal.entityManager.save(ExportInventory, {
            note: data.note,
            exportDate: data.exportDate,
            status: ExportInventoryStatus.REQUESTING,
            contractSymbol: await getHashCodeCode(),
            code: await this.generateSlugKey(),
            documentNumber: await getHashCodeCode(),
            createdBy: {
                id: user.id,
            },
            updatedBy: {
                id: user.id,
            },
            department: {
                id: data.departmentId ? data.departmentId : null,
            },
            importRequest: {
                id: data.importRequestId ? data.importRequestId : null,
            },
        });
    }

    async updateOne(user: User, id: string, data: UpdateExportInventoryDTO) {
        const exportInventory = await this.getRequestingExportInventory(id);

        return await NKGlobal.entityManager.update(
            ExportInventory,
            {
                id: exportInventory.id,
            },
            {
                note: data.note,
                exportDate: data.exportDate,
                status: ExportInventoryStatus.REQUESTING,
                updatedBy: {
                    id: user.id,
                },
                department: {
                    id: data.departmentId ? data.departmentId : null,
                },
                importRequest: {
                    id: data.importRequestId ? data.importRequestId : null,
                },
            },
        );
    }

    async deleteExportInventoryItem(user: User, id: string, itemId: string) {
        // check export inventory status

        return await NKTransaction.transaction(
            NKGlobal.entityManager,
            async (entityManager) => {
                const exportInventory = await this.getRequestingExportInventory(id);

                const res = await entityManager.delete(ExportInventoryItem, {
                    id: itemId,
                });

                await entityManager.update(
                    ExportInventory,
                    {
                        id: exportInventory.id,
                    },
                    {
                        updatedBy: {
                            id: user.id,
                        },
                    },
                );
                return res;
            },
            {},
        );
    }

    async cancelExportInventory(user: User, id: string, dto: UpdateStatusExportInventoryDTO) {
        await this.getOneByField('id', id);

        return await NKGlobal.entityManager.update(
            ExportInventory,
            {
                id,
            },
            {
                note: dto.note,
                status: ExportInventoryStatus.CANCELLED,
                updatedBy: {
                    id: user.id,
                },
            },
        );
    }

    async addExportInventoryItem(user: User, id: string, dto: AddExportInventoryItemDTO) {
        if ((dto.supplyId && dto.equipmentId) || (!dto.supplyId && !dto.equipmentId)) {
            throw new NKResponseException(
                nkMessage.error.exportInventoryItemOnlySupplyOrEquipment,
                HttpStatus.BAD_REQUEST,
            );
        }

        const exportInventory = await this.getRequestingExportInventory(id);

        if (dto.supplyId) {
            await this.supplyService.getOneByField('id', dto.supplyId);
        }

        if (dto.equipmentId) {
            const equipment = await this.equipmentService.getOneByField('id', dto.equipmentId);
            const currentStatus = await this.equipmentStatusService.getCurrentStatus(equipment.id);
            const isDraftStatus = currentStatus.currentStatus === EquipmentStatusType.IDLE;

            if (dto.quantity > 1) {
                throw new NKResponseException(nkMessage.error.equipmentMustBeOne, HttpStatus.BAD_REQUEST);
            }

            if (!isDraftStatus) {
                throw new NKResponseException(nkMessage.error.equipmentMustBeIdle, HttpStatus.BAD_REQUEST);
            }
        }

        return await NKTransaction.transaction(
            NKGlobal.entityManager,
            async (entityManager) => {
                if (dto.supplyId) {
                    const supply = await this.supplyService.getOneByField('id', dto.supplyId);

                    if (dto.quantity > supply.quantity) {
                        throw new NKResponseException(nkMessage.error.supplyQuantityNotEnough, HttpStatus.BAD_REQUEST, {
                            quantity: supply.quantity,
                        });
                    }
                    const existExportInventoryItem = exportInventory.exportInventoryItems.find(
                        (item) => item?.supply && item?.supply?.id === dto.supplyId,
                    );

                    if (exportInventory.importRequest) {
                        const importRequestItem = exportInventory.importRequest.importRequestItems.find(
                            (item) => item?.supply && item?.supply?.id === dto.supplyId,
                        );

                        const exportedQuantity = existExportInventoryItem?.quantity || 0;

                        //check quantity not greater than import request quantity
                        if (exportedQuantity + dto.quantity > supply.quantity) {
                            throw new NKResponseException(
                                nkMessage.error.exportInventoryItemQuantityNotGreaterImportRequestQuantity,
                                HttpStatus.BAD_REQUEST,
                            );
                        }
                    }
                    if (existExportInventoryItem) {
                        //check quantity not greater than supply quantity
                        if (existExportInventoryItem.quantity + dto.quantity > supply.quantity) {
                            throw new NKResponseException(
                                nkMessage.error.supplyQuantityNotEnough,
                                HttpStatus.BAD_REQUEST,
                                {
                                    quantity: supply.quantity,
                                },
                            );
                        } else {
                            dto.quantity += existExportInventoryItem.quantity;
                            return await entityManager.update(
                                ExportInventoryItem,
                                {
                                    id: existExportInventoryItem.id,
                                },
                                {
                                    quantity: dto.quantity,
                                },
                            );
                        }
                    }
                }

                await entityManager.save(ExportInventoryItem, {
                    quantity: dto.quantity,
                    note: dto.note,
                    exportInventory: {
                        id: exportInventory.id,
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
                    ExportInventory,
                    {
                        id: exportInventory.id,
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

    async updateExportInventoryItem(user: User, id: string, itemId: string, dto: UpdateExportInventoryItemDTO) {
        const exportInventory = await this.getRequestingExportInventory(id);
        const exportInventoryItem = await this.exportInventoryItemService.getOneByField('id', itemId);

        if (exportInventoryItem.equipment && dto.quantity > 1) {
            throw new NKResponseException(nkMessage.error.equipmentQuantityMustBeOne, HttpStatus.BAD_REQUEST);
        }

        return NKTransaction.transaction(
            NKGlobal.entityManager,
            async (entityManager) => {
                // check supply quantity
                if (exportInventoryItem.supply) {
                    const supply = await this.supplyService.getOneByField('id', exportInventoryItem.supply.id);

                    if (dto.quantity > supply.quantity) {
                        throw new NKResponseException(nkMessage.error.supplyQuantityNotEnough, HttpStatus.BAD_REQUEST, {
                            quantity: supply.quantity,
                        });
                    }

                    if (exportInventory.importRequest) {
                        const importInventoryItem = exportInventory.importRequest.importRequestItems.find(
                            (item) => item?.supply && item?.supply?.id === exportInventoryItem.supply.id,
                        );

                        //check quantity not greater than import request quantity
                        if (dto.quantity > importInventoryItem.quantity) {
                            throw new NKResponseException(
                                nkMessage.error.exportInventoryItemQuantityNotGreaterImportRequestQuantity,
                                HttpStatus.BAD_REQUEST,
                            );
                        }
                    }
                }

                await entityManager.update(
                    ExportInventoryItem,
                    {
                        id: itemId,
                    },
                    {
                        quantity: dto.quantity,
                        note: dto.note,
                    },
                );

                await entityManager.update(
                    ExportInventory,
                    {
                        id: exportInventory.id,
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

    async getAllSupplyByDepartmentId(departmentId: string) {
        const supplies = await NKGlobal.entityManager.find(ExportInventory, {
            where: {
                department: {
                    id: departmentId,
                },
                status: ExportInventoryStatus.APPROVED,
            },
            relations: ['department'],
        });

        const exportInventory = await this.getManyByField(
            'id',
            supplies.map((item) => item.id),
        );

        const exportInventoryItems = exportInventory
            .map((item) => item.exportInventoryItems)
            .flat()
            .filter((item) => item.supply);

        // group by supply
        const exportInventoryItemsGroupBySupply = exportInventoryItems.reduce((acc, item) => {
            if (!acc[item.supply.id]) {
                acc[item.supply.id] = {
                    supply: item.supply,
                    quantity: 0,
                };
            }

            acc[item.supply.id].quantity += item.quantity;

            return acc;
        }, {});

        const formattedSupplies = Object.values(exportInventoryItemsGroupBySupply)
            .map((item: any) => ({
                ...item.supply,
                quantity: item.quantity,
            }))
            .filter((item: any) => item.quantity > 0);
        // remove
        return formattedSupplies;
    }

    async approveExportInventory(user: User, id: string, dto: UpdateStatusExportInventoryDTO) {
        const exportInventory = await this.getRequestingExportInventory(id);

        //check item not empty
        if (exportInventory.exportInventoryItems.length === 0) {
            throw new NKResponseException(nkMessage.error.exportInventoryItemEmpty, HttpStatus.BAD_REQUEST);
        }

        // check supply quantity
        await Promise.all(
            exportInventory.exportInventoryItems.map(async (item) => {
                if (item.supply) {
                    const supply = await this.supplyService.getOneByField('id', item.supply.id);

                    if (item.quantity > supply.quantity) {
                        throw new NKResponseException(nkMessage.error.supplyQuantityNotEnough, HttpStatus.BAD_REQUEST, {
                            quantity: supply.quantity,
                        });
                    }
                }
            }),
        );

        await this.userNotificationService.sendNotificationByRole(
            [UserRoleIndex.ADMIN, UserRoleIndex.FACILITY_MANAGER],
            {
                actionId: exportInventory.id,
                actionType: UserNotificationActionType.EXPORT_INVENTORY_LINK,
                content: `Yêu cầu xuất kho ${exportInventory.code} đã được phê duyệt`,
                title: `Yêu cầu xuất kho ${exportInventory.code} đã được phê duyệt`,
                receiverIds: [],
                senderId: '',
            },
        );

        if (exportInventory.department) {
            const department = await this.departmentService.getOneByField('id', exportInventory.department.id);
            await this.userNotificationService.sendNotification({
                actionId: exportInventory.id,
                actionType: UserNotificationActionType.EXPORT_INVENTORY_LINK,
                content: `Phòng ban ${department.name} đã được phê duyệt yêu cầu xuất kho ${exportInventory.code}`,
                title: `Phòng ban ${department.name} đã được phê duyệt yêu cầu xuất kho ${exportInventory.code}`,
                receiverIds: department.users.map((user) => user.id),
                senderId: '',
            });
        }

        if (exportInventory.importRequest) {
            const repairReport = await this.repairReportService.getOneByField(
                'id',
                exportInventory.importRequest.id,
                false,
            );

            if (repairReport) {
                await this.userNotificationService.sendNotificationByRole(
                    [UserRoleIndex.MAINTENANCE_MANAGER, UserRoleIndex.FACILITY_MANAGER],
                    {
                        actionId: repairReport.id,
                        actionType: UserNotificationActionType.REPAIR_REPORT_LINK,
                        content: exportInventory.note,
                        title: `Quản lý kho vừa xuất kho thiết bị cho đơn bảo trì ${repairReport.code}`,
                        receiverIds: [],
                        senderId: '',
                    },
                );
            }
        }

        await NKTransaction.transaction(
            NKGlobal.entityManager,
            async (entityManager) => {
                await Promise.all(
                    exportInventory.exportInventoryItems.map(async (item) => {
                        if (item.supply) {
                            if (item.supply.quantity < item.quantity) {
                                throw new NKResponseException(
                                    nkMessage.error.supplyQuantityNotEnough,
                                    HttpStatus.BAD_REQUEST,
                                    {
                                        quantity: item.supply.quantity,
                                    },
                                );
                            }

                            await entityManager.update(
                                Supply,
                                {
                                    id: item.supply.id,
                                },
                                {
                                    quantity: () => `quantity - ${item.quantity}`,
                                },
                            );
                        }

                        if (item.equipment) {
                            await this.equipmentStatusService.addOne(
                                item.equipment.id,
                                EquipmentStatusType.ACTIVE,
                                'Xuất kho',
                            );

                            //update import date for equipment
                            await entityManager.update(
                                Equipment,
                                {
                                    id: item.equipment.id,
                                },
                                {
                                    department: {
                                        id: exportInventory.department.id,
                                    },
                                },
                            );
                        }
                    }),
                );

                await entityManager.update(
                    ExportInventory,
                    {
                        id: exportInventory.id,
                    },
                    {
                        note: dto.note,
                        status: ExportInventoryStatus.APPROVED,
                        updatedBy: {
                            id: user.id,
                        },
                    },
                );
            },
            {},
        );

        await new Promise((resolve, reject) => {
            setTimeout(async () => {
                await this.importRequestCron.handleCron();
                resolve(true);
            }, 1000);
        });
    }

    async getExportBySupplyId(supplyId: string) {
        const exportInventories = await NKGlobal.entityManager
            .createQueryBuilder(ExportInventory, 'exportInventory')
            .leftJoinAndSelect('exportInventory.exportInventoryItems', 'exportInventoryItems')
            .leftJoinAndSelect('exportInventoryItems.supply', 'supply')
            .where('exportInventoryItems.supply.id = :supplyId', { supplyId })
            .andWhere('exportInventory.status = :status', { status: ExportInventoryStatus.APPROVED })
            .getMany();

        return exportInventories;
    }
}
