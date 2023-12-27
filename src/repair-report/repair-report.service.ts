import { HttpStatus } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { NKService } from '../core/decorators/NKService.decorator';
import { NKResponseException, nkMessage } from '../core/exception';
import { EquipmentStatusType } from '../equipment-status/equipment-status.entity';
import { EquipmentStatusService } from '../equipment-status/equipment-status.service';
import { EquipmentService } from '../equipment/equipment.service';
import { RepairReplaceItem } from '../repair-replace-item/repair-replace-item.entity';
import {
    RepairReportItem,
    RepairReportItemPaymentStatus,
    RepairReportItemStatus,
} from '../repair-report-item/repair-report-item.entity';
import { RepairReportItemService } from '../repair-report-item/repair-report-item.service';
import { SupplyService } from '../supply/supply.service';
import { User } from '../user/user.entity';
import { AddRepairReportItemDto } from './dto/add-repair-report-item.dto';
import { CreateRepairReportDto } from './dto/create-repair-report.dto';
import { UpdateRepairReportItemDto } from './dto/update-repair-report-item.dto';
import { UpdateRepairReportDto } from './dto/update-repair-report.dto';
import { RepairReport, RepairReportStatus } from './repair-report.entity';
import { AddRepairReplaceItemDto } from 'src/repair-replace-item/dto/add-repair-replace-item.dto';
import { UpdateRepairReplaceItemDto } from 'src/repair-replace-item/dto/update-repair-replace-item.dto';
import { RepairProviderService } from 'src/repair-provider/repair-provider.service';
import { UserNotificationService } from 'src/user-notification/user-notification.service';
import { UserNotificationActionType } from 'src/user-notification/user-notification.entity';
import { UserRoleIndex } from 'src/user-role/user-role.constant';
import { NKGlobal } from 'src/core/common/NKGlobal';
import { Department } from 'src/department/department.entity';
import { DepartmentService } from 'src/department/department.service';
import { Cron } from '@nestjs/schedule';
import { NKLOGGER_NS, nkLogger } from 'src/core/logger';
import { ImportRequestService } from 'src/import-request/import-request.service';
import { ImportRequestExpected, ImportRequestStatus } from 'src/import-request/import-request.entity';
import moment from 'moment';
import { getSlugCode } from 'src/core/util';

@NKService()
export class RepairReportService extends NKServiceBase<RepairReport> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
        private readonly equipmentService: EquipmentService,
        private readonly equipmentStatusService: EquipmentStatusService,
        private readonly repairProviderService: RepairProviderService,
        private readonly repairReportItemService: RepairReportItemService,
        private readonly supplyService: SupplyService,
        private readonly userNotificationService: UserNotificationService,
        private readonly departmentService: DepartmentService,
        private readonly importRequestService: ImportRequestService,
    ) {
        super(entityManager.getRepository(RepairReport));
    }

    async restoreSlug() {
        console.log('restoreSlug');
        const exportInventories = await NKGlobal.entityManager.find(RepairReport, {
            where: {
                code: '',
            },
        });

        console.log('exportInventories', exportInventories.length);

        await Promise.all(
            exportInventories.map(async (item) => {
                await NKGlobal.entityManager.update(
                    RepairReport,
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
        let newSlug = `BT${date.format('DDMMYY')}${await getSlugCode()}`;

        while (await this.getOneByField('code', newSlug, false)) {
            newSlug = `BT${date.format('DDMMYY')}${await getSlugCode()}`;
        }

        return newSlug;
    };

    async getFixingRepairReport(id: string) {
        const repairReport = await this.getOneByField('id', id);

        if (
            repairReport.status !== RepairReportStatus.FIXING &&
            repairReport.status !== RepairReportStatus.REQUESTING
        ) {
            throw new NKResponseException(nkMessage.error.repairReportMustBeFixing, HttpStatus.BAD_REQUEST);
        }

        return repairReport;
    }

    async createOne(user: User, dto: CreateRepairReportDto) {
        let repairReport = await this.entityManager.save(RepairReport, {
            status: RepairReportStatus.REQUESTING,
            description: dto.description,
            note: dto.note,
            startAt: dto.startAt,
            endAt: dto.endAt,
            price: dto.price,
            code: await this.generateSlugKey(),
            brokenDate: dto.brokenDate,
            createdBy: {
                id: user.id,
            },
            updatedBy: {
                id: user.id,
            },
        });

        repairReport = await this.getOneByField('id', repairReport.id);

        await this.userNotificationService.sendNotificationByRole(
            [UserRoleIndex.ADMIN, UserRoleIndex.INVENTORY_MANAGER, UserRoleIndex.FACILITY_MANAGER],
            {
                actionId: repairReport.id,
                actionType: UserNotificationActionType.REPAIR_REPORT_LINK,
                content: `Quản lý bảo trì vừa tạo 1 kế hoạch bảo trì mới: ${repairReport.description}`,
                title: `Quản lý bảo trì vừa tạo 1 kế hoạch bảo trì mới`,
                receiverIds: [],
                senderId: '',
            },
        );

        if (user.role.index === UserRoleIndex.HEALTHCARE_STAFF) {
            await this.userNotificationService.sendNotificationByRole([UserRoleIndex.MAINTENANCE_MANAGER], {
                actionId: repairReport.id,
                actionType: UserNotificationActionType.REPAIR_REPORT_LINK,
                content: `${repairReport.description}`,
                title: `Nhân viên vừa gửi 1 yêu cầu sửa chữa thiết bị`,
                receiverIds: [],
                senderId: '',
            });
        }

        for (const item of dto.repairReportItems) {
            const data = await this.addRepairReportItem(repairReport.id, user, item);
            //find department by equipment
        }

        return repairReport;
    }

    async getRepairReportCompleteByEquipmentId(equipmentId: string) {
        const repairReport = await this.entityManager.find(RepairReportItem, {
            where: {
                equipment: {
                    id: equipmentId,
                },
            },
            relations: ['repairReport', 'equipment'],
        });

        return await this.repairReportItemService.getManyByField(
            'id',
            repairReport.map((item) => item.id),
        );
    }

    async updateOne(id: string, user: User, dto: UpdateRepairReportDto) {
        const repairReport = await this.getOneByField('id', id);

        repairReport.description = dto.description;
        repairReport.note = dto.note;
        repairReport.startAt = dto.startAt;
        repairReport.endAt = dto.endAt;
        repairReport.status = dto.status;
        repairReport.price = dto.price;
        repairReport.brokenDate = dto.brokenDate;

        repairReport.updatedBy = user;

        if (dto.status === RepairReportStatus.FIXING) {
            //check repair report item is not empty
            if (repairReport.repairReportItems.length === 0) {
                throw new NKResponseException(nkMessage.error.repairReportItemEmpty, HttpStatus.BAD_REQUEST);
            }

            // check over overlap time with other repair report of each equipment
            const repairReports = await this.entityManager
                .createQueryBuilder(RepairReport, 'repairReport')

                .leftJoinAndSelect('repairReport.repairReportItems', 'repairReportItems')
                .leftJoinAndSelect('repairReportItems.equipment', 'equipment')
                .where('equipment.id in (:...equipmentIds)', {
                    equipmentIds: repairReport.repairReportItems.map((item) => item.equipment.id),
                })
                .andWhere('repairReport.status = :status', { status: RepairReportStatus.FIXING })

                .andWhere('repairReport.id != :id', { id: repairReport.id })
                .andWhere('repairReport.startAt <= :endAt', { endAt: repairReport.endAt })
                .andWhere('repairReport.endAt >= :startAt', { startAt: repairReport.startAt })
                .getMany();

            if (repairReports.length > 0) {
                throw new NKResponseException(nkMessage.error.dataContext, HttpStatus.BAD_REQUEST, {
                    data: JSON.stringify(
                        repairReports
                            .map((item) => {
                                const equipments = item.repairReportItems.map((item) => item.equipment);

                                return equipments.map((subItem) => ({
                                    id: subItem.id,
                                    from: moment(item.startAt).format('DD/MM/YYYY'),
                                    to: moment(item.endAt).format('DD/MM/YYYY'),
                                }));
                            })
                            .flat(),
                    ),
                });
            }

            // check replace item is not empty
            let repairReplaceItems = repairReport.repairReportItems.map((item) => item.repairReplaceItems).flat();
            // group by supply id
            repairReplaceItems = repairReplaceItems.reduce((acc, cur) => {
                const found = acc.find((item) => item.supply.id === cur.supply.id);
                if (found) {
                    found.quantity += cur.quantity;
                } else {
                    acc.push(cur);
                }
                return acc;
            }, []);

            if (repairReplaceItems.length !== 0) {
                if (repairReport.importRequestId) {
                    const importRequest = await this.importRequestService.getOneByField(
                        'id',
                        repairReport.importRequestId,
                    );

                    repairReport.status = RepairReportStatus.FIXING;
                    await this.userNotificationService.sendNotification({
                        actionId: repairReport.id,
                        actionType: UserNotificationActionType.REPAIR_REPORT_LINK,
                        content: `${repairReport.note}`,
                        title: `Đơn yêu cầu sửa chữa thiết bị đã được chấp nhận`,
                        receiverIds: [repairReport.createdBy.id],
                        senderId: '',
                    });
                    await Promise.all(
                        repairReport.repairReportItems.map(async (item) => {
                            const equipment = await this.equipmentService.getOneByField('id', item.equipment.id);
                            if (equipment.department) {
                                const department = await this.departmentService.getOneByField(
                                    'id',
                                    equipment.department.id,
                                );
                                if (department) {
                                    await this.userNotificationService.sendNotification({
                                        actionId: repairReport.id,
                                        actionType: UserNotificationActionType.REPAIR_REPORT_LINK,
                                        content: `Thiết bị ${equipment.name} tại phòng của bạn sẽ được tiến hành bảo trì từ ngày ${repairReport.startAt} đến ${repairReport.endAt}`,
                                        title: `Thiết bị ${equipment.name} tại phòng của bạn sẽ được tiến hành bảo trì từ ngày ${repairReport.startAt} đến ${repairReport.endAt}`,
                                        receiverIds: department.users.map((user) => user.id),
                                        senderId: '',
                                    });
                                }
                            }
                        }),
                    );
                } else {
                    repairReport.status = RepairReportStatus.WAITING_FOR_SUPPLY;
                    const importRequest = await this.importRequestService.createOne(
                        user,
                        {
                            departmentId: '',
                            description: '',
                            expected: ImportRequestExpected.HOUR_72,
                            importRequestItems: repairReplaceItems.map((item) => ({
                                supplyId: item.supply.id,
                                quantity: item.quantity,
                                equipmentId: null,
                            })),
                            name: 'Xuất kho sửa chữa đơn  ' + repairReport.code,
                        },
                        ImportRequestStatus.REQUESTING,
                    );

                    // send notification to facility manager
                    await this.userNotificationService.sendNotificationByRole([UserRoleIndex.FACILITY_MANAGER], {
                        actionId: importRequest.id,
                        actionType: UserNotificationActionType.IMPORT_REQUEST_LINK,
                        content: repairReport.description,
                        title: `Quản lý bảo trì vừa gửi yêu cầu cung cấp thiết bị cho đơn bảo trì ${repairReport.code}`,
                        receiverIds: [],
                        senderId: '',
                    });

                    repairReport.importRequestId = importRequest.id;
                }
            } else {
                repairReport.status = RepairReportStatus.FIXING;
                if (repairReport.createdBy.role.index !== UserRoleIndex.MAINTENANCE_MANAGER) {
                    await this.userNotificationService.sendNotification({
                        actionId: repairReport.id,
                        actionType: UserNotificationActionType.REPAIR_REPORT_LINK,
                        content: repairReport.note,
                        title: `Đơn yêu cầu sửa chữa thiết bị đã được chấp nhận`,
                        receiverIds: [repairReport.createdBy.id],
                        senderId: '',
                    });
                } else {
                    await this.userNotificationService.sendNotification({
                        actionId: repairReport.id,
                        actionType: UserNotificationActionType.REPAIR_REPORT_LINK,
                        content: `Bạn vừa tạo 1 kế hoạch bảo trì ${repairReport.code}: ${repairReport.description}`,
                        title: `Bạn vừa tạo 1 kế hoạch bảo trì mới`,
                        receiverIds: [repairReport.createdBy.id],
                        senderId: '',
                    });
                }

                await Promise.all(
                    repairReport.repairReportItems.map(async (item) => {
                        const equipment = await this.equipmentService.getOneByField('id', item.equipment.id);
                        if (equipment.department) {
                            const department = await this.departmentService.getOneByField(
                                'id',
                                equipment.department.id,
                            );
                            if (department) {
                                await this.userNotificationService.sendNotification({
                                    actionId: repairReport.id,
                                    actionType: UserNotificationActionType.REPAIR_REPORT_LINK,
                                    content: `Thiết bị ${equipment.name} tại phòng của bạn sẽ được tiến hành bảo trì từ ngày ${repairReport.startAt} đến ${repairReport.endAt}`,
                                    title: `Thiết bị ${equipment.name} tại phòng của bạn sẽ được tiến hành bảo trì từ ngày ${repairReport.startAt} đến ${repairReport.endAt}`,
                                    receiverIds: department.users.map((user) => user.id),
                                    senderId: '',
                                });
                            }
                        }
                    }),
                );

                await this.userNotificationService.sendNotificationByRole(
                    [UserRoleIndex.ADMIN, UserRoleIndex.FACILITY_MANAGER, UserRoleIndex.INVENTORY_MANAGER],
                    {
                        actionId: repairReport.id,
                        actionType: UserNotificationActionType.REPAIR_REPORT_LINK,
                        content: `Quản lý bảo trì vừa tạo 1 kế hoạch bảo trì ${repairReport.code}: ${repairReport.description}`,
                        title: `Quản lý bảo trì vừa tạo 1 kế hoạch bảo trì mới`,
                        receiverIds: [],
                        senderId: '',
                    },
                );
            }
        }

        if (dto.status === RepairReportStatus.CANCELLED) {
            await Promise.all(
                repairReport.repairReportItems.map(async (item) => {
                    if (item.createdBy.role.index !== UserRoleIndex.MAINTENANCE_MANAGER) {
                        const equipment = await this.equipmentService.getOneByField('id', item.equipment.id);
                        if (equipment.department) {
                            const department = await this.departmentService.getOneByField(
                                'id',
                                equipment.department.id,
                            );
                            if (department) {
                                await this.userNotificationService.sendNotification({
                                    actionId: repairReport.id,
                                    actionType: UserNotificationActionType.REPAIR_REPORT_LINK,
                                    content: `Đơn yêu cầu sửa chữa thiết bị đã bị từ chối, description: ${repairReport.note}`,
                                    title: `Đơn yêu cầu sửa chữa thiết bị đã bị từ chối, description: ${repairReport.note}`,
                                    receiverIds: [repairReport.createdBy.id],
                                    senderId: '',
                                });
                            }
                        }
                    }
                }),
            );
        }

        if (dto.status === RepairReportStatus.COMPLETED) {
            //check all repair report item is completed
            const isAllCompleted = repairReport.repairReportItems.every(
                (item) =>
                    item.status === RepairReportItemStatus.COMPLETED ||
                    item.status === RepairReportItemStatus.CANCELLED,
            );

            if (!isAllCompleted) {
                throw new NKResponseException(
                    nkMessage.error.repairReportItemNotCompletedOrCancelled,
                    HttpStatus.BAD_REQUEST,
                );
            }

            await Promise.all(
                repairReport.repairReportItems.map(async (item) => {
                    const equipment = await this.equipmentService.getOneByField('id', item.equipment.id);
                    if (equipment.department) {
                        const department = await this.departmentService.getOneByField('id', equipment.department.id);
                        if (department) {
                            await this.userNotificationService.sendNotification({
                                actionId: repairReport.id,
                                actionType: UserNotificationActionType.REPAIR_REPORT_LINK,
                                content: `Thiết bị ${equipment.name} tại phòng bạn của bạn đã hoàn tất quá trình bảo trì`,
                                title: `Thông báo bảo trì thiết bị ${equipment.name} đã hoàn thành`,
                                receiverIds: department.users.map((user) => user.id),
                                senderId: '',
                            });
                        }
                    }
                }),
            );

            await this.userNotificationService.sendNotificationByRole(
                [
                    UserRoleIndex.ADMIN,
                    UserRoleIndex.FACILITY_MANAGER,
                    UserRoleIndex.INVENTORY_MANAGER,
                    UserRoleIndex.MAINTENANCE_MANAGER,
                ],
                {
                    actionId: repairReport.id,
                    actionType: UserNotificationActionType.REPAIR_REPORT_LINK,
                    content: `Kế hoạch bảo trì ${repairReport.code} từ ngày ${moment(repairReport.startAt).format(
                        'DD/MM/YYYY',
                    )} đến ${moment(repairReport.endAt).format('DD/MM/YYYY')} đã hoàn thành`,

                    title: `Kế hoạch bảo trì ${repairReport.code} đã hoàn thành`,
                    receiverIds: [],
                    senderId: '',
                },
            );
        }

        return await this.entityManager.save(repairReport);
    }

    async addRepairReportItem(repairReportId: string, user: User, dto: AddRepairReportItemDto) {
        const repairReport = await this.getFixingRepairReport(repairReportId);
        const equipment = await this.equipmentService.getOneByFieldNotDraft('id', dto.equipmentId);

        const supplies = await this.supplyService.getManyByField(
            'id',
            dto.replaceItems.map((item) => item.supplyId),
        );

        if (supplies.length !== dto.replaceItems.length) {
            throw new NKResponseException(nkMessage.error.notFound, HttpStatus.BAD_REQUEST, {
                entity: 'Vật tư',
            });
        }

        const repairProviders = await this.repairProviderService.getManyByField('id', dto.repairProviderIds);

        let repairReportItem = await this.entityManager.save(RepairReportItem, {
            description: dto.description,
            imageUrls: dto.imageUrls,
            type: dto.type,

            status: RepairReportItemStatus.WAITING,
            createdBy: {
                id: user.id,
            },
            updatedBy: {
                id: user.id,
            },
            repairReport: {
                id: repairReport.id,
            },
            equipment: {
                id: equipment.id,
            },
        });

        await Promise.all(
            dto.replaceItems.map(async (item) => {
                return await this.addReplaceItem(repairReportItem.id, item);
            }),
        );

        repairReportItem = await this.repairReportItemService.getOneByField('id', repairReportItem.id);

        repairReportItem.repairProviders = repairProviders;

        return await this.entityManager.save(repairReportItem);
    }

    async addReplaceItem(repairReportItemId: string, dto: AddRepairReplaceItemDto) {
        const repairReportItem = await this.repairReportItemService.getOneByField('id', repairReportItemId);

        const supply = await this.supplyService.getOneByField('id', dto.supplyId);

        const repairReplaceItem = await this.entityManager.save(RepairReplaceItem, {
            quantity: dto.quantity,
            supply: {
                id: supply.id,
            },
            repairReportItem: {
                id: repairReportItem.id,
            },
        });

        return repairReplaceItem;
    }

    async updateReplaceItem(repairReportItemId: string, repairReplaceItemId: string, dto: UpdateRepairReplaceItemDto) {
        await this.repairReportItemService.getOneByField('id', repairReportItemId);

        const repairReplaceItem = await this.entityManager.update(
            RepairReplaceItem,
            { id: repairReplaceItemId },
            {
                quantity: dto.quantity,
            },
        );

        return repairReplaceItem;
    }

    async deleteReplaceItem(repairReportItemId: string, repairReplaceItemId: string) {
        await this.repairReportItemService.getOneByField('id', repairReportItemId);

        const repairReplaceItem = await this.entityManager.delete(RepairReplaceItem, {
            id: repairReplaceItemId,
        });

        return repairReplaceItem;
    }

    async updateRepairReportItem(
        repairReportId: string,
        repairReportItemId: string,
        user: User,
        dto: UpdateRepairReportItemDto,
    ) {
        await this.getFixingRepairReport(repairReportId);

        let repairReportItem = await this.repairReportItemService.getOneByField('id', repairReportItemId);
        const repairProviders = await this.repairProviderService.getManyByField('id', dto.repairProviderIds);

        await this.entityManager.update(
            RepairReportItem,
            { id: repairReportItem.id },
            {
                description: dto.description,
                imageUrls: dto.imageUrls,

                type: dto.type,
                status: dto.status,
                updatedBy: {
                    id: user.id,
                },
            },
        );

        repairReportItem = await this.repairReportItemService.getOneByField('id', repairReportItemId);
        if (dto.status === RepairReportItemStatus.COMPLETED) {
            await this.equipmentStatusService.addOne(
                repairReportItem.equipment.id,
                EquipmentStatusType.ACTIVE,
                `Thiết bị ${repairReportItem.equipment.name} đã được sửa chữa`,
            );
        }

        repairReportItem.repairProviders = repairProviders;
        return await this.entityManager.save(repairReportItem);
    }

    async deleteRepairReportItem(repairReportId: string, repairReportItemId: string, user: User) {
        const repairReport = await this.getFixingRepairReport(repairReportId);

        const repairReportItem = await this.repairReportItemService.getOneByField('id', repairReportItemId);

        repairReport.repairReportItems = repairReport.repairReportItems.filter(
            (item) => item.id !== repairReportItem.id,
        );

        await this.entityManager.save(repairReport);

        await this.entityManager.update(
            RepairReport,
            { id: repairReportItem.id },
            {
                updatedBy: {
                    id: user.id,
                },
                updatedAt: new Date(),
            },
        );

        // await this.entityManager.delete(RepairReportItem, {
        //     id: repairReportItem.id,
        // });
    }
}
