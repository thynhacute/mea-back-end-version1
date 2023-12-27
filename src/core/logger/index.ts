import { LoggerService } from '@nestjs/common';
import debug from 'debug';
import _ from 'lodash';
import moment from 'moment';

export * from './winstons';

export enum NKLOGGER_NS {
    APP_INFO = 'app-info',
    APP_ERROR = 'app-error',
    APP_WARN = 'app-warn',
    APP_DATABASE = 'app-database',
    APP_QUEUE = 'app-queue',
    APP_CRON = 'app-cron',
    HTTP = 'http-api',
    SERVICE_MAIL = 'service-mail',
    SERVICE_SMS = 'service-sms',
    SERVICE_FIREBASE = 'service-firebase',
}

interface LoggerItem {
    ns: string;
    logger: debug.Debugger;
}

const loggers: LoggerItem[] = [];

export function nkLogger(ns: string, ...args: any[]) {
    const logMsgs = [];
    let logger = loggers.find((l) => l.ns === ns)?.logger;

    if (typeof args === 'object') {
        const flatArgs = _.flattenDeep(args);

        flatArgs.forEach((arg) => {
            if (typeof arg === 'object') {
                logMsgs.push(JSON.stringify(arg));
                Object.keys(arg).forEach((key) => {
                    logMsgs.push(`${key}: ${arg[key]}`);
                });
            } else {
                logMsgs.push(arg);
            }
        });
    }

    if (!logger) {
        logger = debug(ns);
        loggers.push({ ns, logger: logger });
    }

    logMsgs.forEach((msg) => {
        const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
        logger(`${currentDateTime} - ${msg}`);
    });
}

export class CustomLoggerService implements LoggerService {
    /**
     * Write a 'log' level log.
     */
    log(...optionalParams: any[]) {
        nkLogger(NKLOGGER_NS.APP_INFO, optionalParams);
    }

    /**
     * Write an 'error' level log.
     */
    error(...optionalParams: any[]) {
        nkLogger(NKLOGGER_NS.APP_ERROR, optionalParams);
    }

    /**
     * Write a 'warn' level log.
     */
    warn(...optionalParams: any[]) {
        nkLogger(NKLOGGER_NS.APP_WARN, optionalParams);
    }
}
