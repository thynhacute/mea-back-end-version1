import { NKGlobal } from '../common/NKGlobal';
import { NKKey } from '../common/NKKey';
import { NKControllerOption } from './interfaces/controller.interface';
import { Controller, Injectable, Scope, SetMetadata, applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { kebabCase, startCase } from 'lodash';

export const NKController = (option: NKControllerOption) => {
    const apiName = option?.model?.type?.name || option?.apiName;
    const version = option?.version || 'v1';

    NKGlobal.serviceOptions[apiName] = option;

    return applyDecorators(
        ApiTags(startCase(apiName)),

        SetMetadata(NKKey.REFLECT_CONTROLLER, option),
        Controller('/api/' + version + '/' + kebabCase(apiName)),
        Injectable({
            scope: Scope.DEFAULT,
        }),
    );
};
