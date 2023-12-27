import { Get } from '@nestjs/common';

import moment from 'moment';
import { NKOpenApiController } from './core/decorators/NKOpenApiController.decorator';
import { NKRouter } from './core/decorators/NKRouter.decorator';
import { nkMoment } from './core/util';

@NKOpenApiController({
    apiName: 'app',
})
export class AppOpenController {
    constructor() {}

    @NKRouter({
        method: Get('/time'),
    })
    getTime() {
        return {
            time: new Date(),
            moment: moment().format('YYYY-MM-DD HH:mm:ss'),
            nkTime: nkMoment().format('YYYY-MM-DD HH:mm:ss'),
        };
    }
}
