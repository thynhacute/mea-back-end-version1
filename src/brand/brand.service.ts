import { Injectable } from '@nestjs/common';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { NKService } from '../core/decorators/NKService.decorator';
import { Brand } from './brand.entity';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@NKService()
export class BrandService extends NKServiceBase<Brand> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) {
        super(entityManager.getRepository(Brand));
    }

    async createOne(dto: CreateBrandDto) {
        await this.validateUniqueField('code', dto.code);
        await this.validateUniqueField('name', dto.name);

        return this.entityManager.save(Brand, {
            name: dto.name,
            code: dto.code,
            description: dto.description,
            imageUrl: dto.imageUrl,
        });
    }

    async updateOne(id: string, dto: UpdateBrandDto) {
        const brand = await this.getOneByField('id', id);
        await this.validateUniqueField('code', dto.code, brand.id);
        await this.validateUniqueField('name', dto.name, brand.id);

        return this.entityManager.update(
            Brand,
            {
                id,
            },
            {
                name: dto.name,
                code: dto.code,
                description: dto.description,
                imageUrl: dto.imageUrl,
            },
        );
    }
}
