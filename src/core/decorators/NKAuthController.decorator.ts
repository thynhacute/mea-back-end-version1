import { NKCurdController } from './NKCurdController.decorator';
import { NKCurdControllerAuthOption } from './interfaces/controller.interface';
import { UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { AuthGuard } from '../../auth/guard/auth.guard';
import { PermissionGuard } from '../../auth/guard/permission.guard';
import { ResourceGuard } from '../../auth/guard/resource.guard';

export const NKAuthController = (option: NKCurdControllerAuthOption) => {
    return applyDecorators(
        ApiBearerAuth(),
        NKCurdController(option),
        UseGuards(AuthGuard),
        UseGuards(PermissionGuard),
        UseGuards(ResourceGuard),
    );
};
