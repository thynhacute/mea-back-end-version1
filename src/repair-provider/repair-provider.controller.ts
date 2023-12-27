import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Put, Req } from '@nestjs/common';
import { RepairProviderService } from './repair-provider.service';
import { NKAuthController } from 'src/core/decorators/NKAuthController.decorator';
import { RepairProvider, RepairProviderStatus } from './repair-provider.entity';
import { RouterBaseMethodEnum } from 'src/core/enum/RouterBaseMethodEnum';
import { UserRoleIndex } from 'src/user-role/user-role.constant';
import { NKCurdControllerBase } from 'src/core/common/NKCurdControllerBase';
import { Reflector } from '@nestjs/core';
import { NKKey } from 'src/core/common/NKKey';
import { JoiValidatorPipe } from 'src/core/pipe';
import { NKMethodRouter } from 'src/core/decorators/NKMethodRouter.decorator';
import { CreateRepairProviderDTO } from './dto/create-repair-provider.dto';
import { UpdateRepairProviderDTO } from './dto/update-repair-provider.dto';
import { EnumListItem } from 'src/core/common/dtos/paging.dto';
import { kebabCase } from 'lodash';
import { Colors } from 'src/core/util/colors.helper';

@NKAuthController({
    model: {
        type: RepairProvider,
    },
    baseMethods: [
        RouterBaseMethodEnum.GET_ALL,
        RouterBaseMethodEnum.GET_ONE,
        RouterBaseMethodEnum.GET_PAGING,
        RouterBaseMethodEnum.DELETE_ONE,
        RouterBaseMethodEnum.GET_SELECT_OPTION,
    ],
    isAllowDelete: true,
    permission: UserRoleIndex.USER,
    selectOptionField: 'name',
    query: {
        isShowDelete: false,
    },
})
export class RepairProviderController extends NKCurdControllerBase<RepairProvider> {
    constructor(private readonly repairProviderService: RepairProviderService) {
        const reflector = new Reflector();
        repairProviderService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, RepairProviderController);
        super(repairProviderService);
    }

    @NKMethodRouter(Post('/'))
    async createImportInventory(
        @Body(new JoiValidatorPipe(CreateRepairProviderDTO.validate)) body: CreateRepairProviderDTO,
    ) {
        return this.repairProviderService.createOne(body);
    }

    @NKMethodRouter(Put('/:id'))
    async updateImportInventory(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Body(new JoiValidatorPipe(UpdateRepairProviderDTO.validate)) body: UpdateRepairProviderDTO,
    ) {
        return this.repairProviderService.updateOne(id, body);
    }

    @NKMethodRouter(Get('/enum-options/status'))
    getStatusOptions(): EnumListItem[] {
        return [
            {
                id: RepairProviderStatus.ACTIVE,
                label: 'Hoạt động',
                name: 'Hoạt động',
                value: RepairProviderStatus.ACTIVE,
                color: Colors.GREEN,
                slug: kebabCase(RepairProviderStatus.ACTIVE),
            },
            {
                id: RepairProviderStatus.INACTIVE,
                label: 'Không hoạt động',
                name: 'Không hoạt động',
                value: RepairProviderStatus.INACTIVE,
                color: Colors.RED,
                slug: kebabCase(RepairProviderStatus.INACTIVE),
            },
        ];
    }
}
