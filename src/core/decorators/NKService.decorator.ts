import { Injectable, Scope, applyDecorators } from '@nestjs/common';

export const NKService = () => {
    return applyDecorators(
        Injectable({
            scope: Scope.REQUEST,
        }),
    );
};
