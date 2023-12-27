import { ApiProperty, PickType } from '@nestjs/swagger';
import joi from 'joi';
import { constant } from 'src/core';
import { EquipmentMaintainSchedule } from '../equipment-maintain-schedule.entity';

export class CreateEquipmentMaintainScheduleDTO extends PickType(EquipmentMaintainSchedule, [
    'maintenanceDate',
    'note',
]) {
    @ApiProperty({ description: 'Equipment Id', example: '123' })
    equipmentId: string;

    static validate = joi.object<CreateEquipmentMaintainScheduleDTO>({
        maintenanceDate: joi
            .date()
            .greater('now')
            .required()
            .messages({
                'date.greater': 'phải lớn hơn ngày hiện tại',
                ...constant.messageFormat,
            }),
        note: joi.string().allow('').messages(constant.messageFormat),
        equipmentId: joi.string().required().messages(constant.messageFormat),
    });
}
