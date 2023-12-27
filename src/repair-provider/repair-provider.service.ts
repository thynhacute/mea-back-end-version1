import { Injectable } from '@nestjs/common';
import { NKServiceBase } from 'src/core/common/NKServiceBase';
import { NKService } from 'src/core/decorators/NKService.decorator';
import { EntityManager } from 'typeorm';
import { RepairProvider, RepairProviderStatus } from './repair-provider.entity';
import { InjectEntityManager } from '@nestjs/typeorm';
import { CreateRepairProviderDTO } from './dto/create-repair-provider.dto';
import { NKGlobal } from 'src/core/common/NKGlobal';
import { UpdateRepairProviderDTO } from './dto/update-repair-provider.dto';
import { SelectOptionDto } from 'src/core/common/dtos/select-options.dto';

@NKService()
export class RepairProviderService extends NKServiceBase<RepairProvider> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) {
        super(entityManager.getRepository(RepairProvider));
    }

    async createOne(data: CreateRepairProviderDTO) {
        return NKGlobal.entityManager.save(RepairProvider, {
            name: data.name,
            address: data.address,
            email: data.email,
            startWorkDate: data.startWorkDate,
            phone: data.phone,
            isExternal: data.isExternal,
            status: RepairProviderStatus.ACTIVE,
        });
    }

    async updateOne(id: string, data: UpdateRepairProviderDTO) {
        await this.getOneByField('id', id);

        return NKGlobal.entityManager.update(
            RepairProvider,
            { id },
            {
                name: data.name,
                address: data.address,
                email: data.email,
                startWorkDate: data.startWorkDate,
                phone: data.phone,
                isExternal: data.isExternal,
                status: data.status,
            },
        );
    }

    async getSelectOption(dto: SelectOptionDto) {
        const res = await super.getSelectOption(dto);

        return res.filter((e) => {
            return e.status === RepairProviderStatus.ACTIVE;
        });
    }
}
