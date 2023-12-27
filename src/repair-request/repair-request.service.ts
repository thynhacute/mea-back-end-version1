import { HttpStatus, Injectable } from '@nestjs/common';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { NKService } from '../core/decorators/NKService.decorator';
import { RepairRequest, RepairRequestStatus } from './repair-request.entity';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { CreateRepairRequestDto } from './dto/create-repair-request.dto';
import { User } from '../user/user.entity';
import { UpdateRepairRequestDto } from './dto/update-repair-request.dto';
import { EquipmentService } from '../equipment/equipment.service';
import { EquipmentStatusService } from '../equipment-status/equipment-status.service';
import { EquipmentStatusType } from '../equipment-status/equipment-status.entity';
import { NKResponseException, nkMessage } from '../core/exception';
import { HttpStatusCode } from 'axios';
import { UpdateStatusRepairRequestDTO } from './dto/update-status-repair-request.dto';

@NKService()
export class RepairRequestService extends NKServiceBase<RepairRequest> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
        private readonly equipmentService: EquipmentService,
        private readonly equipmentStatusService: EquipmentStatusService,
    ) {
        super(entityManager.getRepository(RepairRequest));
    }

    async createOne(user: User, dto: CreateRepairRequestDto) {
        const equipment = await this.equipmentService.getOneByField('id', dto.equipmentId);

        const currentStatus = await this.equipmentStatusService.getCurrentStatus(equipment.id);
        if (!currentStatus || currentStatus.currentStatus === EquipmentStatusType.DRAFT) {
            throw new NKResponseException(nkMessage.error.equipmentMustNotBeDraft, HttpStatus.BAD_REQUEST);
        }

        return this.entityManager.save(RepairRequest, {
            description: dto.description,
            imageUrls: dto.imageUrls,
            createdBy: {
                id: user.id,
            },
            updatedBy: {
                id: user.id,
            },
            equipment: {
                id: dto.equipmentId,
            },
        });
    }

    async updateOne(id: string, user: User, dto: UpdateRepairRequestDto) {
        const equipment = await this.equipmentService.getOneByField('id', dto.equipmentId);
        const currentStatus = await this.equipmentStatusService.getCurrentStatus(equipment.id);
        if (!currentStatus || currentStatus.currentStatus === EquipmentStatusType.DRAFT) {
            throw new NKResponseException(nkMessage.error.equipmentMustNotBeDraft, HttpStatus.BAD_REQUEST);
        }

        await this.getOneByField('id', id);

        return this.entityManager.update(
            RepairRequest,
            {
                id,
            },
            {
                description: dto.description,
                imageUrls: dto.imageUrls,
                status: dto.status,
                updatedBy: {
                    id: user.id,
                },
                equipment: {
                    id: dto.equipmentId,
                },
            },
        );
    }

    async cancelOne(id: string, user: User, dto: UpdateStatusRepairRequestDTO) {
        await this.getOneByField('id', id);

        return this.entityManager.update(
            RepairRequest,
            {
                id,
            },
            {
                note: dto.note,
                status: RepairRequestStatus.REJECTED,
                updatedBy: {
                    id: user.id,
                },
            },
        );
    }

    async approveOne(id: string, user: User, dto: UpdateStatusRepairRequestDTO) {
        await this.getOneByField('id', id);

        return this.entityManager.update(
            RepairRequest,
            {
                id,
            },
            {
                note: dto.note,
                status: RepairRequestStatus.APPROVED,
                updatedBy: {
                    id: user.id,
                },
            },
        );
    }
}
