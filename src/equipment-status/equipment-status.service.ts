import { Injectable } from '@nestjs/common';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { NKService } from '../core/decorators/NKService.decorator';
import { EquipmentStatus, EquipmentStatusType } from './equipment-status.entity';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@NKService()
export class EquipmentStatusService extends NKServiceBase<EquipmentStatus> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) {
        super(entityManager.getRepository(EquipmentStatus));
    }

    async getCurrentStatus(equipmentId: string) {
        const lastStatus = await this.entityManager.findOne(EquipmentStatus, {
            where: {
                equipment: {
                    id: equipmentId,
                },
                isDeleted: false,
            },

            relations: ['equipment'],
            order: {
                createdAt: 'DESC',
            },
        });

        return lastStatus;
    }

    async addOne(equipmentId: string, nextStatusType: EquipmentStatusType, note: string) {
        const lastStatus = await this.entityManager.findOne(EquipmentStatus, {
            where: {
                equipment: {
                    id: equipmentId,
                },
            },
            relations: ['equipment'],
            order: {
                createdAt: 'DESC',
            },
        });

        if (lastStatus && lastStatus.currentStatus === nextStatusType) {
            return lastStatus;
        }

        const newStatus = new EquipmentStatus();
        newStatus.equipment = {
            id: equipmentId,
        } as any;
        newStatus.lastStatus = lastStatus ? lastStatus.currentStatus : null;
        newStatus.currentStatus = nextStatusType;

        return this.entityManager.save(EquipmentStatus, {
            lastStatus: lastStatus ? lastStatus.currentStatus : null,
            currentStatus: nextStatusType,
            note: note,
            equipment: {
                id: equipmentId,
            },
        });
    }
}
