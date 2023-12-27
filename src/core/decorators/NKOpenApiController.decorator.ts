import { NKOpenApiControllerOption } from './interfaces/controller.interface';
import { Controller, applyDecorators } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { kebabCase, startCase } from 'lodash';

export const NKOpenApiController = (option: NKOpenApiControllerOption) => {
    const apiName = option?.apiName;
    const version = option?.version || 'v1';

    return applyDecorators(
        ApiTags(startCase(apiName)),
        Controller('/api/open-api/' + version + '/' + kebabCase(apiName)),
    );
};
