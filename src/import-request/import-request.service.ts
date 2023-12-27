import { HttpStatus } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import moment from 'moment';
import { SelectOptionDto } from 'src/core/common/dtos/select-options.dto';
import { getSlugCode } from 'src/core/util';
import { UserNotificationActionType } from 'src/user-notification/user-notification.entity';
import { UserNotificationService } from 'src/user-notification/user-notification.service';
import { UserRoleIndex } from 'src/user-role/user-role.constant';
import { EntityManager } from 'typeorm';
import { NKGlobal } from '../core/common/NKGlobal';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { NKTransaction } from '../core/common/NKTransaction';
import { NKService } from '../core/decorators/NKService.decorator';
import { NKResponseException, nkMessage } from '../core/exception';
import { DepartmentService } from '../department/department.service';
import { EquipmentService } from '../equipment/equipment.service';
import { ImportRequestItem } from '../import-request-item/import-request-item.entity';
import { SupplyService } from '../supply/supply.service';
import { User } from '../user/user.entity';
import { AddImportRequestItemDTO } from './dto/add-import-request-item.dto';
import { ChangeApproveQuantityDto } from './dto/change-approve-quantity.dto';
import { CreateImportRequestDTO } from './dto/create-import-request.dto';
import { UpdateImportRequestItemDTO } from './dto/update-import-request-item.dto';
import { UpdateImportRequestDTO } from './dto/update-import-request.dto';
import { UpdateStatusImportRequestDTO } from './dto/update-status-import-request.dto';
import { ImportRequest, ImportRequestStatus } from './import-request.entity';
import { RepairReport } from 'src/repair-report/repair-report.entity';

@NKService()
export class ImportRequestService extends NKServiceBase<ImportRequest> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
        private readonly departmentService: DepartmentService,
        private readonly equipmentService: EquipmentService,
        private readonly supplyService: SupplyService,
        private readonly userNotification: UserNotificationService,
    ) {
        super(entityManager.getRepository(ImportRequest));
    }

    async restoreSlug() {
        console.log('restoreSlug');
        const exportInventories = await NKGlobal.entityManager.find(ImportRequest, {
            where: {
                code: '',
            },
        });

        await Promise.all(
            exportInventories.map(async (item) => {
                await NKGlobal.entityManager.update(
                    ImportRequest,
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

    async changeApproveQuantity(id: string, dto: ChangeApproveQuantityDto) {
        return await NKGlobal.entityManager.update(ImportRequestItem, { id }, { approveQuantity: dto.approveQuantity });
    }

    generateSlugKey = async (date = moment()) => {
        let newSlug = `DT${date.format('DDMMYY')}${await getSlugCode()}`;

        while (await this.getOneByField('code', newSlug, false)) {
            newSlug = `DT${date.format('DDMMYY')}${await getSlugCode()}`;
        }

        return newSlug;
    };

    async getDraftImportRequest(id: string) {
        const importRequest = await this.getOneByField('id', id);

        if (importRequest.status !== ImportRequestStatus.DRAFT) {
            throw new NKResponseException(nkMessage.error.importRequestMustBeDraft, HttpStatus.BAD_REQUEST);
        }

        return importRequest;
    }

    async getUpdatedImportRequest(id: string) {
        const importRequest = await this.getOneByField('id', id);

        if (importRequest.status !== ImportRequestStatus.UPDATED) {
            throw new NKResponseException(nkMessage.error.importRequestMustBeUpdated, HttpStatus.BAD_REQUEST);
        }

        return importRequest;
    }

    async getRequestingImportRequest(id: string) {
        const importRequest = await this.getOneByField('id', id);

        if (importRequest.status !== ImportRequestStatus.REQUESTING) {
            throw new NKResponseException(nkMessage.error.importRequestMustBeRequest, HttpStatus.BAD_REQUEST);
        }

        return importRequest;
    }

    async createOne(user: User, dto: CreateImportRequestDTO, status = ImportRequestStatus.DRAFT) {
        if (dto.departmentId) {
            await this.departmentService.getOneByField('id', dto.departmentId);
        }

        let importRequest = await NKGlobal.entityManager.save(ImportRequest, {
            name: dto.name,
            description: dto.description,
            status: status,
            expected: dto.expected,
            code: await this.generateSlugKey(),
            department: {
                id: dto.departmentId ? dto.departmentId : null,
            },
            createdBy: {
                id: user.id,
            },
            updatedBy: {
                id: user.id,
            },
        });

        importRequest = await this.getOneByField('id', importRequest.id);

        await Promise.all(
            dto.importRequestItems.map(async (item) => this.addImportRequestItem(user, importRequest.id, item)),
        );

        await this.userNotification.sendNotificationByRole([UserRoleIndex.ADMIN], {
            title: `Quản lý vật tư vừa tạo 1 kế hoạch mua sắm mới: ${importRequest.description}`,
            content: `Quản lý vật tư vừa tạo 1 kế hoạch mua sắm mới: ${importRequest.description}`,
            actionId: importRequest.id,
            actionType: UserNotificationActionType.IMPORT_REQUEST_LINK,
            receiverIds: [],
            senderId: '',
        });

        return importRequest;
    }

    async updateOne(user: User, id: string, dto: UpdateImportRequestDTO) {
        if (dto.departmentId) {
            await this.departmentService.getOneByField('id', dto.departmentId);
        }
        const importRequest = await this.getDraftImportRequest(id);

        return await NKGlobal.entityManager.update(
            ImportRequest,
            {
                id: importRequest.id,
            },
            {
                name: dto.name,
                expected: dto.expected,
                description: dto.description,
                status: ImportRequestStatus.DRAFT,
                department: {
                    id: dto.departmentId ? dto.departmentId : null,
                },
                updatedBy: {
                    id: user.id,
                },
            },
        );
    }

    async deleteImportRequestItem(user: User, id: string, itemId: string) {
        // check import request status
        await this.getRequestingImportRequest(id);

        return await NKTransaction.transaction(
            NKGlobal.entityManager,
            async (entityManager) => {
                const importRequest = await this.getRequestingImportRequest(id);

                await entityManager.delete(ImportRequestItem, {
                    id: itemId,
                });

                await entityManager.update(
                    ImportRequest,
                    {
                        id: importRequest.id,
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

    async addImportRequestItem(user: User, id: string, dto: AddImportRequestItemDTO) {
        if (dto.supplyId && dto.equipmentId) {
            throw new NKResponseException(
                nkMessage.error.importRequestItemOnlySupplyOrEquipmentOrNull,
                HttpStatus.BAD_REQUEST,
            );
        }

        if (dto.supplyId) {
            await this.supplyService.getOneByField('id', dto.supplyId);
        }

        if (dto.equipmentId) {
            await this.equipmentService.getOneByField('id', dto.equipmentId);
        }

        const importRequest = await this.getOneByField('id', id);

        return await NKTransaction.transaction(
            NKGlobal.entityManager,
            async (entityManager) => {
                const existItem = importRequest.importRequestItems.find((e) => {
                    return e.supply?.id === dto.supplyId || e.equipment?.id === dto.equipmentId;
                });
                if (existItem) {
                    await entityManager.update(
                        ImportRequestItem,
                        {
                            id: existItem.id,
                        },
                        {
                            quantity: existItem.quantity + dto.quantity,
                            approveQuantity: existItem.approveQuantity + dto.quantity,
                        },
                    );
                } else {
                    const importRequestItem = await entityManager.save(ImportRequestItem, {
                        quantity: dto.quantity,
                        approveQuantity: dto.quantity,
                        supply: {
                            id: dto.supplyId ? dto.supplyId : null,
                        },
                        equipment: {
                            id: dto.equipmentId ? dto.equipmentId : null,
                        },
                        importRequest: {
                            id: importRequest.id,
                        },
                    });
                }

                await entityManager.update(
                    ImportRequest,
                    {
                        id: importRequest.id,
                    },
                    {
                        updatedBy: {
                            id: user.id,
                        },
                    },
                );

                return importRequest;
            },
            {},
        );
    }

    async updateImportRequestItem(user: User, id: string, itemId: string, dto: UpdateImportRequestItemDTO) {
        if (dto.supplyId && dto.equipmentId) {
            throw new NKResponseException(
                nkMessage.error.importRequestItemOnlySupplyOrEquipmentOrNull,
                HttpStatus.BAD_REQUEST,
            );
        }

        const importRequest = await this.getRequestingImportRequest(id);

        return NKTransaction.transaction(
            NKGlobal.entityManager,
            async (entityManager) => {
                await entityManager.update(
                    ImportRequestItem,
                    {
                        id: itemId,
                    },
                    {
                        quantity: dto.quantity,
                        approveQuantity: dto.quantity,
                    },
                );

                await entityManager.update(
                    ImportRequest,
                    {
                        id: importRequest.id,
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

    async approveImportRequest(user: User, id: string, dto: UpdateStatusImportRequestDTO) {
        const importRequest = await this.getUpdatedImportRequest(id);

        const repairReport = await NKGlobal.entityManager.findOne(RepairReport, {
            where: {
                importRequestId: importRequest.id,
            },
        });

        if (repairReport) {
            await this.userNotification.sendNotification({
                title: `Đơn yêu cầu thiết bị ${importRequest.name} của bạn đã được chấp nhận: ${importRequest.note}`,
                content: `Đơn yêu cầu thiết bị ${importRequest.name} của bạn đã được chấp nhận: ${importRequest.note}`,
                actionId: repairReport.id,
                actionType: UserNotificationActionType.REPAIR_REPORT_LINK,
                receiverIds: [importRequest.createdBy.id],
                senderId: '',
            });
        } else {
            await this.userNotification.sendNotification({
                title: `Đơn yêu cầu thiết bị ${importRequest.name} của bạn đã được chấp nhận: ${importRequest.note}`,
                content: `Đơn yêu cầu thiết bị ${importRequest.name} của bạn đã được chấp nhận: ${importRequest.note}`,
                actionId: importRequest.id,
                actionType: UserNotificationActionType.IMPORT_REQUEST_LINK,
                receiverIds: [importRequest.createdBy.id],
                senderId: '',
            });
        }

        return NKTransaction.transaction(
            NKGlobal.entityManager,
            async (entityManager) => {
                await entityManager.update(
                    ImportRequest,
                    {
                        id: importRequest.id,
                    },
                    {
                        note: dto.note,
                        status: ImportRequestStatus.APPROVED,
                        updatedBy: {
                            id: user.id,
                        },
                    },
                );
            },
            {},
        );
    }

    async updatedImportRequest(user: User, id: string, dto: UpdateStatusImportRequestDTO) {
        const importRequest = await this.getRequestingImportRequest(id);
        //check if items is empty
        if (importRequest.importRequestItems.length === 0) {
            throw new NKResponseException(nkMessage.error.importRequestItemMustBeNotEmpty, HttpStatus.BAD_REQUEST);
        }

        await this.userNotification.sendNotificationByRole([UserRoleIndex.INVENTORY_MANAGER], {
            title: ` Quản lý vật tư vừa gửi yêu cầu cung cấp thiết bị cho đơn bảo trì ${importRequest.code}`,
            content: importRequest.description,
            actionId: importRequest.id,
            actionType: UserNotificationActionType.IMPORT_REQUEST_LINK,
            receiverIds: [importRequest.createdBy.id],
            senderId: '',
        });

        return NKTransaction.transaction(
            NKGlobal.entityManager,
            async (entityManager) => {
                await entityManager.update(
                    ImportRequest,
                    {
                        id: importRequest.id,
                    },
                    {
                        status: ImportRequestStatus.UPDATED,
                        note: dto.note,
                        updatedBy: {
                            id: user.id,
                        },
                    },
                );
            },
            {},
        );
    }

    async submitImportRequest(user: User, id: string) {
        const importRequest = await this.getDraftImportRequest(id);

        if (user.role.index === UserRoleIndex.HEALTHCARE_STAFF) {
            await this.userNotification.sendNotificationByRole([UserRoleIndex.FACILITY_MANAGER], {
                title: `Nhân viên y tế gửi đơn yêu cầu đặt thiết bị: ${importRequest.description}`,
                content: `${importRequest.description}`,
                actionId: importRequest.id,
                actionType: UserNotificationActionType.IMPORT_REQUEST_LINK,
                receiverIds: [],
                senderId: '',
            });
        } else {
            await this.userNotification.sendNotificationByRole([UserRoleIndex.INVENTORY_MANAGER], {
                title: `Quản lý vật tư đã gửi yêu cầu cung cấp thiết bị: ${importRequest.description}`,
                content: `Quản lý vật tư đã gửi yêu cầu cung cấp thiết bị: ${importRequest.description}`,
                actionId: importRequest.id,
                actionType: UserNotificationActionType.IMPORT_REQUEST_LINK,
                receiverIds: [],
                senderId: '',
            });
        }

        return NKTransaction.transaction(
            NKGlobal.entityManager,
            async (entityManager) => {
                await entityManager.update(
                    ImportRequest,
                    {
                        id: importRequest.id,
                    },
                    {
                        status: ImportRequestStatus.REQUESTING,
                        updatedBy: {
                            id: user.id,
                        },
                    },
                );
            },
            {},
        );
    }

    async cancelImportRequest(user: User, id: string, dto: UpdateStatusImportRequestDTO) {
        const importRequest = await this.getOneByField('id', id);

        await this.userNotification.sendNotification({
            title: `Đơn yêu cầu thiết bị ${importRequest.name} của bạn đã bị từ chối: ${importRequest.note}`,
            content: `Đơn yêu cầu thiết bị ${importRequest.name} của bạn đã bị từ chối: ${importRequest.note}`,
            actionId: importRequest.id,
            actionType: UserNotificationActionType.IMPORT_REQUEST_LINK,
            receiverIds: [importRequest.createdBy.id],
            senderId: '',
        });

        return await NKGlobal.entityManager.update(
            ImportRequest,
            {
                id,
            },
            {
                status: ImportRequestStatus.CANCELLED,
                note: dto.note,
                updatedBy: {
                    id: user.id,
                },
            },
        );
    }
    async getSelectOption(dto: SelectOptionDto) {
        const res = await super.getSelectOption(dto);

        return res.filter((e) => {
            return e.status !== ImportRequestStatus.DRAFT;
        });
    }

    async changeCompleteStatus(id: string) {
        const importRequest = await this.getOneByField('id', id);

        await this.userNotification.sendNotification({
            title: `Đơn yêu cầu thiết bị ${importRequest.code} đã hoàn thành`,
            content: importRequest.description,
            actionId: importRequest.id,
            actionType: UserNotificationActionType.IMPORT_REQUEST_LINK,
            receiverIds: [importRequest.createdBy.id],
            senderId: '',
        });

        await this.userNotification.sendNotificationByRole([UserRoleIndex.FACILITY_MANAGER], {
            title: `Đơn yêu cầu thiết bị ${importRequest.code} đã hoàn thành`,
            content: importRequest.description,
            actionId: importRequest.id,
            actionType: UserNotificationActionType.IMPORT_REQUEST_LINK,
            receiverIds: [],
            senderId: '',
        });

        return await NKGlobal.entityManager.update(
            ImportRequest,
            {
                id: importRequest.id,
            },
            {
                isDone: true,
                status: ImportRequestStatus.COMPLETED,
            },
        );
    }
}
