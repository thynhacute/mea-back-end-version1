import { PickType } from '@nestjs/swagger';
import joi from 'joi';
import { constant } from '../../core';
import { RepairReportItem } from '../../repair-report-item/repair-report-item.entity';

export class CreateRepairFeedbackDto extends PickType(RepairReportItem, ['feedbackStatus'] as const) {
    static validate = joi.object<CreateRepairFeedbackDto>({
        feedbackStatus: joi.string().required().messages(constant.messageFormat),
    });
}
