import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import Bull, { Queue } from 'bull';
import { constant } from '../constant';
import { QUEUE_PRIORITY } from '../interface/queue.interface';
import { CRON_NAME as CRON_NAMES } from './cron.constant';
import { BullMonitorExpress } from '@bull-monitor/express';
import { getQueueToken } from '@nestjs/bull';
import { BullAdapter } from '@bull-monitor/root/dist/bull-adapter';
import { genUUID } from '../util';
import { NKGlobal } from '../common/NKGlobal';
import { NKLOGGER_NS } from '../logger';

@Injectable()
export class CronService extends BullMonitorExpress implements OnModuleInit {
    constructor(private readonly moduleRef: ModuleRef) {
        super({
            queues: [],
            gqlIntrospection: true,
            metrics: {
                maxMetrics: 100,
            },
        });
    }

    onModuleInit() {
        this.setQueues([...Object.keys(CRON_NAMES).map((key) => new BullAdapter(this.getCron(key as any)))]);
        this.handleInitCron();
    }

    getCron(cronName: CRON_NAMES) {
        return this.moduleRef.get<Queue>(getQueueToken(cronName), { strict: false });
    }

    async handleInitCron() {
        this.add(
            CRON_NAMES.USER_TOKEN,
            {},
            {
                jobId: CRON_NAMES.USER_TOKEN,
                repeat: {
                    cron: '*/1 * * * *',
                },
            },
        );
    }

    private add(cronName: CRON_NAMES, dto: any, options: Bull.JobOptions) {
        const cron = this.getCron(cronName);

        if (cron) {
            cron.add(dto, {
                removeOnComplete: true,
                removeOnFail: false,
                lifo: false,
                attempts: constant.QUEUE_DEFAULT_ATTEMPTS,
                timeout: constant.QUEUE_DEFAULT_TIMEOUT,
                priority: QUEUE_PRIORITY.LOW,
                ...options,
            });
        }
    }

    async addNoticeBoard(dto: any, options?: Bull.JobOptions) {
        this.add(CRON_NAMES.MAIN_CRON, dto, {
            ...options,
        });
    }
}
