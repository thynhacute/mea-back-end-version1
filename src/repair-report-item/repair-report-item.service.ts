import { NKServiceBase } from '../core/common/NKServiceBase';
import { NKService } from '../core/decorators/NKService.decorator';
import { RepairReportItem } from './repair-report-item.entity';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { CreateRepairFeedbackDto } from './dto/create-repair-feedback.dto';
import { UserNotificationService } from 'src/user-notification/user-notification.service';
import { UserNotificationActionType } from 'src/user-notification/user-notification.entity';
import { UserRoleIndex } from 'src/user-role/user-role.constant';

@NKService()
export class RepairReportItemService extends NKServiceBase<RepairReportItem> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
        private readonly userNotificationService: UserNotificationService,
    ) {
        super(entityManager.getRepository(RepairReportItem));
    }

    async getByDepartmentId(departmentId: string) {
        const repairReportItems = await this.entityManager
            .createQueryBuilder(RepairReportItem, 'repairReportItem')
            .leftJoinAndSelect('repairReportItem.equipment', 'equipment')
            .leftJoinAndSelect('equipment.department', 'department')
            .where('department.id = :departmentId', { departmentId })
            .getMany();

        return this.getManyByField(
            'id',
            repairReportItems.map((repairReportItem) => repairReportItem.id),
        );
    }

    async createFeedback(repairReportId: string, dto: CreateRepairFeedbackDto) {
        const repairReportItem = await this.getOneByField('id', repairReportId);
        repairReportItem.feedbackStatus = dto.feedbackStatus;

        await this.userNotificationService.sendNotificationByRole(
            [UserRoleIndex.FACILITY_MANAGER, UserRoleIndex.MAINTENANCE_MANAGER],
            {
                actionId: repairReportItem.repairReport.id,
                actionType: UserNotificationActionType.REPAIR_REPORT_LINK,
                content: dto.feedbackStatus === 'ACCEPTED' ? 'Đã chấp nhận' : 'Đã từ chối',
                title: ` Nhân viên y tế vừa phản hồi tình trạng thiết bị bảo trì ${repairReportItem.equipment.name}`,
                receiverIds: [],
                senderId: '',
            },
        );
        return this.entityManager.save(repairReportItem);
    }
}
