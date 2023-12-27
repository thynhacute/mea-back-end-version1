import { Injectable } from '@nestjs/common';
import { NKServiceBase } from '../core/common/NKServiceBase';
import { NKService } from '../core/decorators/NKService.decorator';
import { QuantityStatus, Supply, SupplyStatus } from './supply.entity';
import { Brackets, EntityManager, SelectQueryBuilder } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { CreateSupplyDTO } from './dto/create-supply.dto';
import { UpdateSupplyDTO } from './dto/update-supply.dto';
import { PagingFilter } from '../core/common/dtos/paging.dto';
import { BrandService } from '../brand/brand.service';
import { SupplyCategoryService } from '../supply-category/supply-category.service';
import { EquipmentService } from '../equipment/equipment.service';
import { EquipmentCategoryService } from '../equipment-category/equipment-category.service';
import { SelectOptionDto } from 'src/core/common/dtos/select-options.dto';
import { Cron } from '@nestjs/schedule';
import { NKLOGGER_NS, nkLogger } from 'src/core/logger';

@NKService()
export class SupplyService extends NKServiceBase<Supply> {
    constructor(
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
        private readonly brandService: BrandService,
        private readonly supplyCategoryService: SupplyCategoryService,
        private readonly equipmentService: EquipmentService,
        private readonly equipmentCategoryService: EquipmentCategoryService,
    ) {
        super(entityManager.getRepository(Supply));
    }

    @Cron('45 * * * * *')
    async handleCron() {
        nkLogger(NKLOGGER_NS.APP_CRON, 'Check supply quantity status');
        await this.entityManager
            .createQueryBuilder()
            .update(Supply)
            .set({
                quantityStatus: QuantityStatus.AVAILABLE,
            })
            .where('quantity < 1')
            .execute();
    }

    async createOne(dto: CreateSupplyDTO) {
        await this.validateUniqueField('code', dto.code);
        await this.validateUniqueField('name', dto.name);
        await this.brandService.getOneByField('id', dto.brandId);
        await this.supplyCategoryService.getOneByField('id', dto.supplyCategoryId);

        if (dto.equipmentCategoryId === '') {
            await this.equipmentCategoryService.getOneByField('id', dto.equipmentCategoryId);
        }

        return this.entityManager.save(Supply, {
            name: dto.name,
            code: dto.code,
            description: dto.description,
            imageUrls: dto.imageUrls,
            status: dto.status,
            unit: dto.unit,
            quantity: 0,
            quantityStatus: QuantityStatus.AVAILABLE,
            brand: {
                id: dto.brandId,
            },
            supplyCategory: {
                id: dto.supplyCategoryId,
            },
            equipmentCategory: {
                id: dto.equipmentCategoryId === '' ? null : dto.equipmentCategoryId,
            },
        });
    }

    async updateOne(id: string, dto: UpdateSupplyDTO) {
        const supply = await this.getOneByField('id', id);
        await this.validateUniqueField('code', dto.code, supply.id);
        await this.validateUniqueField('name', dto.name, supply.id);
        await this.brandService.getOneByField('id', dto.brandId);
        await this.supplyCategoryService.getOneByField('id', dto.supplyCategoryId);

        if (dto.equipmentCategoryId === '') {
            await this.equipmentCategoryService.getOneByField('id', dto.equipmentCategoryId);
        }

        return this.entityManager.update(
            Supply,
            {
                id,
            },
            {
                name: dto.name,
                code: dto.code,
                description: dto.description,
                imageUrls: dto.imageUrls,
                unit: dto.unit,
                status: dto.status,
                brand: {
                    id: dto.brandId,
                },
                supplyCategory: {
                    id: dto.supplyCategoryId,
                },
                equipmentCategory: {
                    id: dto.equipmentCategoryId === '' ? null : dto.equipmentCategoryId,
                },
            },
        );
    }

    async getSearchPaging(props: PagingFilter, extraQuery?: (query: SelectQueryBuilder<Supply>) => void) {
        const search = props.filters.find((e) => e.field === 'search');

        const res = await super.getPaging(
            {
                ...props,
                filters: props.filters.filter((e) => e.field !== 'search'),
            },
            (query) => {
                // search like name or code
                query.andWhere(
                    new Brackets((qb) => {
                        qb.where('entity.name LIKE :search', {
                            search: `%${search.value}%`,
                        }).orWhere('entity.code LIKE :search', {
                            search: `%${search.value}%`,
                        });
                    }),
                );
            },
        );

        return res;
    }

    async getSelectOption(dto: SelectOptionDto) {
        const res = await super.getSelectOption(dto);

        return res.filter((e) => {
            return e.status === SupplyStatus.ACTIVE;
        });
    }
}
