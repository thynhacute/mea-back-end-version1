import { Cron } from '@nestjs/schedule';
import { InjectEntityManager } from '@nestjs/typeorm';
import { NKLOGGER_NS, nkLogger } from 'src/core/logger';
import { UserNotificationService } from 'src/user-notification/user-notification.service';
import { EntityManager, In } from 'typeorm';
import { NKGlobal } from '../core/common/NKGlobal';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { NKService } from '../core/decorators/NKService.decorator';
import { DepartmentService } from '../department/department.service';
import { EquipmentService } from '../equipment/equipment.service';
import { SupplyService } from '../supply/supply.service';
import { ImportRequest, ImportRequestStatus } from './import-request.entity';
import { Injectable } from '@nestjs/common';
import { ExportInventoryStatus } from 'src/export-inventory/export-inventory.entity';
import { RepairReport, RepairReportStatus } from 'src/repair-report/repair-report.entity';

@Injectable()
export class ImportRequestCron {
    constructor() {}

    @Cron('45 * * * * *')
    async handleCron() {
        nkLogger(NKLOGGER_NS.APP_CRON, 'Check import request is done');

        // get all import request is done is false
        const importRequests = await NKGlobal.entityManager.find(ImportRequest, {
            where: {
                isDone: false,
                isDeleted: false,
            },
            relations: [
                'importRequestItems',
                'importRequestItems.supply',
                'exportInventories',
                'exportInventories.exportInventoryItems',
                'exportInventories.exportInventoryItems.supply',
            ],
        });

        // check all supply is enough quantity
        await Promise.all(
            importRequests.map(async (importRequest) => {
                const groupExportBySupply = importRequest.exportInventories
                    .filter((item) => item.status === ExportInventoryStatus.APPROVED)
                    .map((item) => item.exportInventoryItems)
                    .flat()
                    .reduce((acc, item) => {
                        if (item.supply) {
                            acc[item.supply.id] = acc[item.supply.id]
                                ? acc[item.supply.id] + item.quantity
                                : item.quantity;
                        }
                        return acc;
                    }, {});

                const groupImportRequestBySupply = importRequest.importRequestItems.reduce((acc, item) => {
                    if (item.supply) {
                        acc[item.supply.id] = acc[item.supply.id] ? acc[item.supply.id] + item.quantity : item.quantity;
                    }
                    return acc;
                }, {});

                //check all supply is enough quantity in import request
                let isDone = false;
                for (const key in groupImportRequestBySupply) {
                    if (groupImportRequestBySupply.hasOwnProperty(key)) {
                        const element = groupImportRequestBySupply[key] || 0;

                        if (groupExportBySupply[key] >= element) {
                            isDone = true;
                        } else {
                            isDone = false;
                            break;
                        }
                    }
                }

                // if all supply is enough quantity then update isDone = true
                if (isDone) {
                    await NKGlobal.entityManager.update(
                        ImportRequest,
                        {
                            id: importRequest.id,
                        },
                        {
                            isDone: true,
                        },
                    );
                }
            }),
        );

        // check repair report
        const importRequest = await NKGlobal.entityManager.find(ImportRequest, {
            where: {
                isDone: true,
                isDeleted: false,
                status: ImportRequestStatus.APPROVED,
            },
        });

        // get all repair report
        const repairReports = await NKGlobal.entityManager.find(RepairReport, {
            where: {
                importRequestId: In(importRequest.map((item) => item.id)),
                status: RepairReportStatus.WAITING_FOR_SUPPLY,
            },
        });

        // update repair report status to FIXING
        await Promise.all(
            repairReports.map(async (repairReport) => {
                await NKGlobal.entityManager.update(
                    RepairReport,
                    {
                        id: repairReport.id,
                    },
                    {
                        status: RepairReportStatus.FIXING,
                    },
                );
            }),
        );
    }
}
