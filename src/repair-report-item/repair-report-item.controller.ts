import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { RepairReportItemService } from './repair-report-item.service';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { UserRoleIndex } from '../user-role/user-role.constant';
import { RouterBaseMethodEnum } from '../core/enum/RouterBaseMethodEnum';
import {
    RepairReportItem,
    RepairReportItemFeedbackStatus,
    RepairReportItemPaymentStatus,
    RepairReportItemStatus,
    RepairReportItemType,
} from './repair-report-item.entity';
import { NKCurdControllerBase } from '../core/common/NKCurdControllerBase';
import { Reflector } from '@nestjs/core';
import { NKKey } from '../core/common/NKKey';
import { NKMethodRouter } from '../core/decorators/NKMethodRouter.decorator';
import { EnumListItem } from '../core/common/dtos/paging.dto';
import { kebabCase } from 'lodash';
import { Colors } from '../core/util/colors.helper';
import { NKRouter } from 'src/core/decorators/NKRouter.decorator';
import { CreateRepairFeedbackDto } from './dto/create-repair-feedback.dto';
import { QueryJoiValidatorPipe } from 'src/core/pipe';
import { PagingFilter, PagingFilterDto } from '../core/common/dtos/paging.dto';
import { CompareOperator } from 'src/core/interface';

@NKAuthController({
    model: {
        type: RepairReportItem,
    },
    baseMethods: [
        RouterBaseMethodEnum.GET_ALL,
        RouterBaseMethodEnum.GET_ONE,
        RouterBaseMethodEnum.GET_PAGING,
        RouterBaseMethodEnum.DELETE_ONE,
    ],
    isAllowDelete: true,
    permission: UserRoleIndex.USER,
    selectOptionField: 'name',

    query: {
        isShowDelete: false,
        relations: ['equipment', 'repairReplaceItems', 'repairReplaceItems.supply', 'repairReport'],
    },
})
export class RepairReportItemController extends NKCurdControllerBase<RepairReportItem> {
    constructor(private readonly repairReportItemService: RepairReportItemService) {
        const reflector = new Reflector();
        repairReportItemService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, RepairReportItemController);
        super(repairReportItemService);
    }

    @NKMethodRouter(Get('/department/:departmentId'))
    async getByDepartmentId(
        @Param('departmentId') departmentId: string,
        @Query(new QueryJoiValidatorPipe(PagingFilterDto.validate))
        query: PagingFilter,
    ) {
        const res = await this.repairReportItemService.getByDepartmentId(departmentId);
        console.log(res.map((item) => item.id));

        return await this.repairReportItemService.getPaging({
            orderBy: query.orderBy,
            page: query.page,
            filters: [
                {
                    field: 'id',
                    comparator: CompareOperator.IN.toString(),
                    value: res.map((item) => item.id).join(','),
                },
                ...query.filters,
            ],
            pageSize: query.pageSize,
        });
    }

    @NKMethodRouter(Post('/feedback/:id'))
    async feedback(
        @Param('id') id: string,
        @Body()
        body: CreateRepairFeedbackDto,
    ) {
        return this.repairReportItemService.createFeedback(id, body);
    }

    @NKMethodRouter(Get('/enum-options/type'))
    getTypeOptions(): EnumListItem[] {
        return [
            {
                id: RepairReportItemType.FIXING,
                label: 'Sửa chữa',
                name: 'Sửa chữa',
                value: RepairReportItemType.FIXING,
                color: Colors.GREEN,
                slug: kebabCase(RepairReportItemType.FIXING),
            },
            {
                id: RepairReportItemType.MAINTENANCE,
                label: 'Bảo trì',
                name: 'Bảo trì',
                value: RepairReportItemType.MAINTENANCE,
                color: Colors.YELLOW,
                slug: kebabCase(RepairReportItemType.MAINTENANCE),
            },
        ];
    }

    @NKMethodRouter(Get('/enum-options/payment-status'))
    getPaymentStatusOptions(): EnumListItem[] {
        return [
            {
                id: RepairReportItemPaymentStatus.NONE,
                label: 'Không có',
                name: 'Không có',
                value: RepairReportItemPaymentStatus.NONE,
                color: Colors.GREY,
                slug: kebabCase(RepairReportItemPaymentStatus.NONE),
            },
            {
                id: RepairReportItemPaymentStatus.REQUESTING,
                label: 'Đang yêu cầu',
                name: 'Đang yêu cầu',
                value: RepairReportItemPaymentStatus.REQUESTING,
                color: Colors.YELLOW,
                slug: kebabCase(RepairReportItemPaymentStatus.REQUESTING),
            },
            {
                id: RepairReportItemPaymentStatus.APPROVED,
                label: 'Đã duyệt',
                name: 'Đã duyệt',
                value: RepairReportItemPaymentStatus.APPROVED,
                color: Colors.GREEN,
                slug: kebabCase(RepairReportItemPaymentStatus.APPROVED),
            },
            {
                id: RepairReportItemPaymentStatus.REJECTED,
                label: 'Đã từ chối',
                name: 'Đã từ chối',
                value: RepairReportItemPaymentStatus.REJECTED,
                color: Colors.RED,
                slug: kebabCase(RepairReportItemPaymentStatus.REJECTED),
            },
        ];
    }

    @NKMethodRouter(Get('/enum-options/feed-back-status'))
    getFeedBackStatusOptions(): EnumListItem[] {
        return [
            {
                id: RepairReportItemFeedbackStatus.ACCEPTED,
                label: 'Hoạt động tốt',
                name: 'Hoạt động tốt',
                value: RepairReportItemFeedbackStatus.ACCEPTED,
                color: Colors.GREEN,
                slug: kebabCase(RepairReportItemFeedbackStatus.ACCEPTED),
            },
            {
                id: RepairReportItemFeedbackStatus.REJECTED,
                label: 'Không hoạt động',
                name: 'Không hoạt động',
                value: RepairReportItemFeedbackStatus.REJECTED,
                color: Colors.RED,
                slug: kebabCase(RepairReportItemFeedbackStatus.REJECTED),
            },
        ];
    }

    @NKMethodRouter(Get('/enum-options/status'))
    getStatusOptions(): EnumListItem[] {
        return [
            {
                id: RepairReportItemStatus.COMPLETED,
                label: 'Hoàn thành',
                name: 'Hoàn thành',
                value: RepairReportItemStatus.COMPLETED,
                color: Colors.GREEN,
                slug: kebabCase(RepairReportItemStatus.COMPLETED),
            },
            {
                id: RepairReportItemStatus.WAITING,
                label: 'Chờ sửa chữa',
                name: 'Chờ sửa chữa',
                value: RepairReportItemStatus.WAITING,
                color: Colors.YELLOW,
                slug: kebabCase(RepairReportItemStatus.WAITING),
            },
            {
                id: RepairReportItemStatus.FIXING,
                label: 'Đang sửa chữa',
                name: 'Đang sửa chữa',
                value: RepairReportItemStatus.FIXING,
                color: Colors.BLUE,
                slug: kebabCase(RepairReportItemStatus.FIXING),
            },
            {
                id: RepairReportItemStatus.PAUSED,
                label: 'Tạm dừng sửa chữa',
                name: 'Tạm dừng sửa chữa',
                value: RepairReportItemStatus.PAUSED,
                color: Colors.ORANGE,
                slug: kebabCase(RepairReportItemStatus.PAUSED),
            },
            {
                id: RepairReportItemStatus.CANCELLED,
                label: 'Hủy sửa chữa',
                name: 'Hủy sửa chữa',
                value: RepairReportItemStatus.CANCELLED,
                color: Colors.RED,
                slug: kebabCase(RepairReportItemStatus.CANCELLED),
            },
        ];
    }
}
