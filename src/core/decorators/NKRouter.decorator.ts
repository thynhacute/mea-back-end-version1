import { NKRouterOption } from './interfaces/router.interface';
import { applyDecorators } from '@nestjs/common';

export const NKRouter = (option: NKRouterOption) => {
    return applyDecorators(option.method);
};
