import { Controller, Get } from '@nestjs/common';
import { EquipmentStatusService } from './equipment-status.service';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { EquipmentStatus, EquipmentStatusType } from './equipment-status.entity';
import { NKCurdControllerBase } from '../core/common/NKCurdControllerBase';
import { Reflector } from '@nestjs/core';
import { NKKey } from '../core/common/NKKey';
import { NKMethodRouter } from '../core/decorators/NKMethodRouter.decorator';
import { EnumListItem } from '../core/common/dtos/paging.dto';
import { kebabCase } from 'lodash';
import { Colors } from '../core/util/colors.helper';

@NKAuthController({
    model: {
        type: EquipmentStatus,
    },
    baseMethods: [],
})
export class EquipmentStatusController extends NKCurdControllerBase<EquipmentStatus> {
    constructor(private readonly equipmentStatusService: EquipmentStatusService) {
        const reflector = new Reflector();

        equipmentStatusService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, EquipmentStatusController);
        super(equipmentStatusService);
    }

    @NKMethodRouter(Get('/enum-options/status'))
    getStatusOptions(): EnumListItem[] {
        return [
            {
                id: EquipmentStatusType.ACTIVE,
                label: 'Hoạt động',
                name: 'Hoạt động',
                value: EquipmentStatusType.ACTIVE,
                color: Colors.GREEN,
                slug: kebabCase(EquipmentStatusType.ACTIVE),
            },
            {
                id: EquipmentStatusType.INACTIVE,
                label: 'Không hoạt động',
                name: 'Không hoạt động',
                value: EquipmentStatusType.INACTIVE,
                color: Colors.RED,
                slug: kebabCase(EquipmentStatusType.INACTIVE),
            },
            // {
            //     id: EquipmentStatusType.MAINTENANCE,
            //     label: 'Bảo trì',
            //     name: 'Bảo trì',
            //     value: EquipmentStatusType.MAINTENANCE,
            //     color: Colors.ORANGE,
            //     slug: kebabCase(EquipmentStatusType.MAINTENANCE),
            // },
            {
                id: EquipmentStatusType.BROKEN,
                label: 'Hỏng',
                name: 'Hỏng',
                value: EquipmentStatusType.BROKEN,
                color: Colors.RED,
                slug: kebabCase(EquipmentStatusType.BROKEN),
            },
            {
                id: EquipmentStatusType.FIXING,
                label: 'Sửa chữa',
                name: 'Sửa chữa',
                value: EquipmentStatusType.FIXING,
                color: Colors.YELLOW,
                slug: kebabCase(EquipmentStatusType.FIXING),
            },
            {
                id: EquipmentStatusType.IDLE,
                label: 'Chờ sử dụng',
                name: 'Chờ sử dụng',
                value: EquipmentStatusType.IDLE,
                color: Colors.BLUE,
                slug: kebabCase(EquipmentStatusType.IDLE),
            },
            {
                id: EquipmentStatusType.DRAFT,
                label: 'Nháp',
                name: 'Nháp',
                value: EquipmentStatusType.DRAFT,
                color: Colors.GREY,
                slug: kebabCase(EquipmentStatusType.DRAFT),
            },
        ];
    }
}
