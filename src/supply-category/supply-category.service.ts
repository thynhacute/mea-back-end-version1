import { Injectable } from '@nestjs/common';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { NKService } from '../core/decorators/NKService.decorator';
import { SupplyCategory } from './supply-category.entity';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { CreateSupplyCategoryDto } from './dto/create-supply-category.dto';
import { UpdateSupplyCategoryDto } from './dto/update-supply-category.dto';

@NKService()
export class SupplyCategoryService extends NKServiceBase<SupplyCategory> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) {
        super(entityManager.getRepository(SupplyCategory));
    }

    async createOne(dto: CreateSupplyCategoryDto) {
        await this.validateUniqueField('name', dto.name);

        return this.entityManager.save(SupplyCategory, {
            name: dto.name,
            description: dto.description,
        });
    }

    async updateOne(id: string, dto: UpdateSupplyCategoryDto) {
        await this.validateUniqueField('name', dto.name, id);

        return this.entityManager.update(SupplyCategory, id, {
            name: dto.name,
            description: dto.description,
        });
    }
}
