import { getQueueToken } from '@nestjs/bull';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import Bull, { Queue } from 'bull';
import { constant } from '../constant';
import { QUEUE_PRIORITY } from '../interface/queue.interface';
import { QUEUE_NAME } from './queue.constant';
import { BullMonitorExpress } from '@bull-monitor/express';
import { BullAdapter } from '@bull-monitor/root/dist/bull-adapter';
import { SendDto } from '../../sender/dto/send.dto';
@Injectable()
export class QueueService extends BullMonitorExpress implements OnModuleInit {
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
        this.setQueues([...Object.keys(QUEUE_NAME).map((key) => new BullAdapter(this.getQueue(key as any)))]);
    }

    private add(queueName: QUEUE_NAME, dto: any, options: Bull.JobOptions) {
        const queue = this.getQueue(queueName);
        if (queue) {
            queue.add(dto, {
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

    getQueue(queueName: QUEUE_NAME) {
        return this.moduleRef.get<Queue>(getQueueToken(queueName), { strict: false });
    }

    async addSendMessage(dto: SendDto, options?: Bull.JobOptions) {
        this.add(QUEUE_NAME.SEND, dto, {
            removeOnComplete: false,
            priority: QUEUE_PRIORITY.LOW,
            ...options,
        });
    }
}
