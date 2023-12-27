import { NKGlobal } from '../common/NKGlobal';
import { RouterBaseMethodEnum } from '../enum/RouterBaseMethodEnum';
import { applyDecorators } from '@nestjs/common';
import { NKController } from './NKController.decorator';
import { NKCurdControllerOption } from './interfaces/controller.interface';

export const NKCurdController = (option: NKCurdControllerOption) => {
    const apiName = option?.model?.type?.name || option?.apiName;

    if (!option.baseMethods) {
        option.baseMethods = Object.values(RouterBaseMethodEnum);
    }
    if (!option.isHide) {
        NKGlobal.allowRouters.push(...option.baseMethods.map((item) => `${apiName}-${item}`));
    }
    return applyDecorators(NKController(option));
};
