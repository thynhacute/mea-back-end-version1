import { HttpException, HttpStatus } from '@nestjs/common';
import _ from 'lodash';

export class NKResponseException extends HttpException {
    constructor(message: any, status: HttpStatus, context?: any) {
        if (context) {
            _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

            message = _.get(message, 'message', message);
            message = _.template(message)(context);
        }

        super(message, status);
    }
}
