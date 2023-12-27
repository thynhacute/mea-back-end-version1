import { Body, Controller, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { SettingService } from './setting.service';
import { NKAuthController } from '../core/decorators/NKAuthController.decorator';
import { Setting } from './setting.entity';
import { NKCurdControllerBase } from '../core/common/NKCurdControllerBase';
import { Reflector } from '@nestjs/core';
import { NKKey } from '../core/common/NKKey';
import { UserRoleIndex } from '../user-role/user-role.constant';
import { NKRouter } from '../core/decorators/NKRouter.decorator';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@NKAuthController({
    model: {
        type: Setting,
    },
    permission: UserRoleIndex.USER,
    baseMethods: [],
    isAllowDelete: false,
})
export class SettingController extends NKCurdControllerBase<Setting> {
    constructor(private readonly settingService: SettingService) {
        const reflector = new Reflector();
        settingService.apiOptions = reflector.get(NKKey.REFLECT_CONTROLLER, SettingController);
        super(settingService);
    }

    @ApiExcludeEndpoint()
    @NKRouter({
        method: Put('/:id'),
    })
    async update(
        @Param('id', new ParseUUIDPipe())
        id: string,
        @Body()
        data: UpdateSettingDto,
    ) {
        return this.settingService.update(id, data);
    }
}
