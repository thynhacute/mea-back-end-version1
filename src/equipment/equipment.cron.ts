import { HttpStatus, Injectable } from '@nestjs/common';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { NKService } from '../core/decorators/NKService.decorator';
import { Equipment } from './equipment.entity';
import { Brackets, EntityManager, In, LessThan, LessThanOrEqual, MoreThanOrEqual, SelectQueryBuilder } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { CreateEquipmentDTO } from './dto/create-equipment.dto';
import { UpdateEquipmentDTO } from './dto/update-equipment.dto';
import { NKTransaction } from '../core/common/NKTransaction';
import { NKGlobal } from '../core/common/NKGlobal';
import { EquipmentStatus, EquipmentStatusType } from '../equipment-status/equipment-status.entity';
import { EquipmentCategoryService } from '../equipment-category/equipment-category.service';
import { DepartmentService } from '../department/department.service';
import { PagingFilter } from '../core/common/dtos/paging.dto';
import { CompareOperator } from '../core/interface';
import { UpdateEquipmentStatusDTO } from './dto/update-equipment-status.dto';
import { EquipmentStatusService } from '../equipment-status/equipment-status.service';
import { BrandService } from '../brand/brand.service';
import { NKResponseException, nkMessage } from '../core/exception';
import { HttpStatusCode } from 'axios';
import { SelectOptionDto } from 'src/core/common/dtos/select-options.dto';
import { EquipmentMaintainScheduleService } from '../equipment-maintain-schedule/equipment-maintain-schedule.service';
import { ChangeDepartmentDto } from './dto/change-department.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NKLOGGER_NS, nkLogger } from 'src/core/logger';
import { RepairReport, RepairReportStatus } from 'src/repair-report/repair-report.entity';
import { RepairReportItem, RepairReportItemStatus } from 'src/repair-report-item/repair-report-item.entity';

@Injectable()
export class EquipmentCron {
    async addOne(equipmentId: string, nextStatusType: EquipmentStatusType, note: string) {
        const lastStatus = await NKGlobal.entityManager.findOne(EquipmentStatus, {
            where: {
                equipment: {
                    id: equipmentId,
                },
            },
            relations: ['equipment'],
            order: {
                createdAt: 'DESC',
            },
        });

        if (lastStatus && lastStatus.currentStatus === nextStatusType) {
            return lastStatus;
        }

        const newStatus = new EquipmentStatus();
        newStatus.equipment = {
            id: equipmentId,
        } as any;
        newStatus.lastStatus = lastStatus ? lastStatus.currentStatus : null;
        newStatus.currentStatus = nextStatusType;

        return NKGlobal.entityManager.save(EquipmentStatus, {
            lastStatus: lastStatus ? lastStatus.currentStatus : null,
            currentStatus: nextStatusType,
            note: note,
            equipment: {
                id: equipmentId,
            },
        });
    }

    @Cron(CronExpression.EVERY_30_SECONDS)
    async handleCron() {
        nkLogger(NKLOGGER_NS.APP_CRON, 'Check equipment status is fixing');
        const currentDate = new Date();
        // vietnam time
        currentDate.setHours(currentDate.getHours() + 7);

        const repairReport = await NKGlobal.entityManager.find(RepairReport, {
            where: {
                status: RepairReportStatus.FIXING,
                startAt: LessThanOrEqual(currentDate),
                endAt: MoreThanOrEqual(currentDate),
            },
            // get status of equipment
            relations: [
                'repairReportItems',
                'repairReportItems.equipment',
                'repairReportItems.equipment.equipmentStatus',
            ],
        });

        for (const item of repairReport) {
            for (const reportItem of item.repairReportItems) {
                const currentEquipmentStatus = reportItem.equipment.equipmentStatus.sort(
                    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
                )[0];

                if (
                    reportItem.status !== RepairReportItemStatus.COMPLETED &&
                    reportItem.status !== RepairReportItemStatus.CANCELLED
                ) {
                    if (currentEquipmentStatus.currentStatus !== EquipmentStatusType.FIXING) {
                        await this.addOne(
                            reportItem.equipment.id,
                            EquipmentStatusType.FIXING,
                            `Sửa chữa đơn ${item.code}`,
                        );
                    }
                }
            }
        }
    }
}
