import { applyDecorators } from '@nestjs/common';

export const NKMethodRouter = (methods: MethodDecorator) => {
    return applyDecorators(methods);
};
