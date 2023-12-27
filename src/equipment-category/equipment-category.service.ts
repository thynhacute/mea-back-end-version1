import { Injectable } from '@nestjs/common';
import { NKService } from '../core/decorators/NKService.decorator';
import { EquipmentCategory } from './equipment-category.entity';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { CreateEquipmentCategoryDto } from './dto/create-equipment-category.dto';
import { UpdateEquipmentCategoryDto } from './dto/update-equipment-category.dto';

@NKService()
export class EquipmentCategoryService extends NKServiceBase<EquipmentCategory> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) {
        super(entityManager.getRepository(EquipmentCategory));
    }

    async createOne(dto: CreateEquipmentCategoryDto) {
        await this.validateUniqueField('code', dto.code);
        await this.validateUniqueField('name', dto.name);

        return this.entityManager.save(EquipmentCategory, {
            name: dto.name,
            description: dto.description,
            code: dto.code,
        });
    }

    async updateOne(id: string, dto: UpdateEquipmentCategoryDto) {
        await this.validateUniqueField('code', dto.code, id);
        await this.validateUniqueField('name', dto.name, id);

        return this.entityManager.update(EquipmentCategory, id, {
            name: dto.name,
            description: dto.description,
            code: dto.code,
        });
    }
}
