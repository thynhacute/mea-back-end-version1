import { PickType } from '@nestjs/swagger';
import joi from 'joi';
import { RepairReport } from '../repair-report.entity';
import { constant } from 'src/core';

export class UpdateStatusRepairReportDTO extends PickType(RepairReport, ['note']) {
    static validate = joi.object<UpdateStatusRepairReportDTO>({
        note: joi.string().required().messages(constant.messageFormat),
    });
}
